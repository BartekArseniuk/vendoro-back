const { Order, Payment, Product, User, Address } = require('../models');
const payuService = require('../services/payuService');
const { sendOrderConfirmationToCustomer, sendOrderNotificationToSeller } = require('../services/emailService');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const generateOrderNumber = () => {
            const now = new Date();
            const year = now.getFullYear().toString().slice(2);
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const random = Math.floor(1000 + Math.random() * 9000);
            return `ORD-${year}${month}-${random}`;
        };

        let orderNumber;
        let attempts = 0;
        const maxAttempts = 5;

        do {
            orderNumber = generateOrderNumber();
            const existing = await Order.findOne({ where: { orderNumber } });
            if (!existing) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (attempts === maxAttempts) {
            return res.status(500).json({
                success: false,
                message: 'Nie udało się wygenerować unikalnego numeru zamówienia, spróbuj ponownie',
            });
        }

        const {
            productId,
            shippingMethod,
            shippingAddressId,
            wantInvoice,
            invoiceType,
            privateInvoiceAddressId,
            companyName,
            companyNip,
            companyStreet,
            companyHouseNumber,
            companyPostalCode,
            companyCity,
            productPrice,
            shippingPrice,
            paymentMethod,
        } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produkt nie znaleziony',
            });
        }

        if (product.isSold) {
            return res.status(400).json({
                success: false,
                message: 'Ten produkt został już sprzedany',
            });
        }

        const totalPrice = productPrice + shippingPrice;

        const order = await Order.create({
            userId,
            productId,
            shippingMethod,
            shippingAddressId,
            wantInvoice,
            invoiceType,
            privateInvoiceAddressId,
            companyName,
            companyNip,
            companyStreet,
            companyHouseNumber,
            companyPostalCode,
            companyCity,
            productPrice,
            shippingPrice,
            totalPrice,
            status: 'pending',
            orderNumber,
        });

        const fullOrder = await Order.findByPk(order.id, {
            include: [
                { model: Product, as: 'product', include: [{ model: User, as: 'user' }] },
                { model: User, as: 'user' },
                { model: Address, as: 'shippingAddress' }
            ]
        });

        const payment = await Payment.create({
            orderId: order.id,
            method: paymentMethod || 'cash_on_delivery',
            status: 'pending',
            amount: totalPrice,
        });

        if (paymentMethod !== 'payu') {
            await product.update({ isSold: true });
        }

        if (paymentMethod === 'payu') {
            const orderWithDetails = await Order.findByPk(order.id, {
                include: [
                    { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'phone'] },
                    { model: Product, as: 'product', attributes: ['name'] },
                ],
            });

            const payuResponse = await payuService.createPayUOrder(orderWithDetails, payment);

            if (!payuResponse.redirectUri) {
                throw new Error('Brak linku przekierowania z PayU');
            }

            return res.status(201).json({
                success: true,
                message: 'Zamówienie utworzone, przekieruj użytkownika do płatności PayU',
                order,
                paymentUrl: payuResponse.redirectUri,
            });
        } else {
            return res.status(201).json({
                success: true,
                message: 'Zamówienie utworzone, płatność przy odbiorze',
                order,
            });
        }

    } catch (err) {
        console.error('Błąd przy tworzeniu zamówienia:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy tworzeniu zamówienia',
        });
    }
};

exports.payuCallback = async (req, res) => {
    try {
        const notification = req.body;
        console.log('➡️ Otrzymano callback od PayU:', JSON.stringify(notification, null, 2));

        let orderNumber;
        if (notification.order.description) {
            const match = notification.order.description.match(/ORD-\d+-\d+/);
            if (match) {
                orderNumber = match[0];
            }
        }

        if (!orderNumber) {
            console.error('Nie udało się wyciągnąć orderNumber z opisu');
            return res.status(400).send('Invalid orderNumber');
        }

        const status = notification.order.status;
        const transactionId = notification.order.extOrderId || notification.order.orderId;

        const order = await Order.findOne({
            where: { orderNumber },
            include: [
                { model: Product, as: 'product' }
            ]
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const payment = await Payment.findOne({ where: { orderId: order.id } });
        if (!payment) {
            return res.status(404).send('Payment not found');
        }

        let paymentStatus;
        switch (status) {
            case 'COMPLETED':
                paymentStatus = 'paid';
                break;
            case 'CANCELED':
                paymentStatus = 'cancelled';
                break;
            default:
                paymentStatus = 'pending';
        }

        payment.status = paymentStatus;
        payment.transactionId = transactionId;
        await payment.save();

        if (paymentStatus === 'paid') {
            order.status = 'processing';
            await order.save();

            if (order.product) {
                await order.product.update({ isSold: true });
            }

            const fullOrder = await Order.findByPk(order.id, {
                include: [
                    { model: Product, as: 'product', include: [{ model: User, as: 'user' }] },
                    { model: User, as: 'user' },
                    { model: Address, as: 'shippingAddress' }
                ]
            });

            await sendOrderConfirmationToCustomer(fullOrder.user.email, fullOrder);
            await sendOrderNotificationToSeller(fullOrder.product.user.email, fullOrder);
        }

        if (paymentStatus === 'cancelled') {
            const user = await User.findByPk(order.userId);

            const fullOrder = await Order.findByPk(order.id, {
                include: [
                    { model: Product, as: 'product' },
                    { model: User, as: 'user' }
                ]
            });

            await sendOrderConfirmationToCustomer(user.email, {
                ...fullOrder.toJSON(),
                cancelled: true
            });

            return res.status(200).send('Zamówienie anulowane i usunięte');
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Błąd w PayU callback:', error);
        res.status(500).send('Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;

        const order = await Order.findByPk(id, {
            include: [
                { model: Product, as: 'product' }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Zamówienie nie znalezione',
            });
        }

        if (status === 'cancelled' && order.product) {
            await order.product.update({ isSold: false });
        }

        order.status = status;

        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        return res.json({
            success: true,
            message: 'Status zamówienia zaktualizowany',
            order,
        });
    } catch (err) {
        console.error('Błąd przy aktualizacji statusu zamówienia:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy aktualizacji statusu zamówienia',
        });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, transactionId } = req.body;

        const payment = await Payment.findOne({ where: { orderId } });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Płatność nie znaleziona',
            });
        }

        payment.status = status;
        if (transactionId) payment.transactionId = transactionId;
        await payment.save();

        return res.json({
            success: true,
            message: 'Status płatności zaktualizowany',
            payment,
        });
    } catch (err) {
        console.error('Błąd przy aktualizacji płatności:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy aktualizacji płatności',
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const commonIncludes = [
            {
                model: Product,
                as: 'product',
                attributes: ['name'],
            },
            {
                model: Address,
                as: 'shippingAddress',
                attributes: ['street', 'houseNumber', 'city', 'postalCode']
            },
            {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email', 'phone']
            }
        ];

        const bought = await Order.findAll({
            where: { userId },
            attributes: ['orderNumber', 'trackingNumber', 'status', 'totalPrice', 'createdAt'],
            order: [['createdAt', 'DESC']],
            include: commonIncludes
        });

        const sold = await Order.findAll({
            attributes: ['orderNumber', 'trackingNumber', 'status', 'totalPrice', 'createdAt'],
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { userId },
                    attributes: ['name'],
                },
                {
                    model: Address,
                    as: 'shippingAddress',
                    attributes: ['street', 'houseNumber', 'city', 'postalCode']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName', 'email', 'phone']
                }
            ]
        });

        const formatOrders = (orders) => orders.map(order => ({
            orderNumber: order.orderNumber,
            status: order.status,
            totalPrice: order.totalPrice,
            trackingNumber: order.trackingNumber || null,
            createdAt: order.createdAt,
            productName: order.product?.name || null,
            shippingAddress: order.shippingAddress ? {
                street: order.shippingAddress.street,
                houseNumber: order.shippingAddress.houseNumber,
                city: order.shippingAddress.city,
                postalCode: order.shippingAddress.postalCode,
                recipientName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
                email: order.user?.email || null,
                phone: order.user?.phone || null
            } : null
        }));

        return res.json({
            success: true,
            boughtOrders: formatOrders(bought),
            soldOrders: formatOrders(sold),
        });

    } catch (err) {
        console.error('Błąd przy pobieraniu zamówień:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy pobieraniu zamówień',
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                { model: Payment, as: 'payment' },
                {
                    model: Product,
                    as: 'product',
                    attributes: { exclude: ['photo2', 'photo3', 'photo4', 'photo5'] }
                },
                { model: User, as: 'user' },
                { model: Address, as: 'shippingAddress' },
                { model: Address, as: 'privateInvoiceAddress' },
            ],
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Zamówienie nie znalezione',
            });
        }

        return res.json({
            success: true,
            order,
        });
    } catch (err) {
        console.error('Błąd przy pobieraniu zamówienia:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy pobieraniu zamówienia',
        });
    }
};