const { Order, Payment, Product, User, Address } = require('../models');
const payuService = require('../services/payuService');

exports.createOrder = async (req, res) => {
    try {
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
            paymentMethod,
        } = req.body;

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

        const payment = await Payment.create({
            orderId: order.id,
            method: paymentMethod || 'cash_on_delivery',
            status: 'pending',
            amount: totalPrice,
        });

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

        const order = await Order.findOne({ where: { orderNumber } });
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
            case 'FAILED':
                paymentStatus = 'failed';
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
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Zamówienie nie znalezione',
            });
        }

        order.status = status;
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
        const { userId } = req.params;

        const orders = await Order.findAll({
            where: { userId },
            attributes: ['orderNumber', 'status'],
            order: [['createdAt', 'DESC']],
        });

        return res.json({
            success: true,
            orders,
        });
    } catch (err) {
        console.error('Błąd przy pobieraniu listy zamówień użytkownika:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy pobieraniu listy zamówień',
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