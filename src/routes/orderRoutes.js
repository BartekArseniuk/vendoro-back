const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/ordersController');
const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     summary: Tworzenie nowego zamówienia
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Tworzy nowe zamówienie na podstawie przesłanych danych
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productId
 *               - shippingMethod
 *               - shippingAddressId
 *               - productPrice
 *               - shippingPrice
 *               - paymentMethod
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               productId:
 *                 type: integer
 *                 example: 5
 *               shippingMethod:
 *                 type: string
 *                 example: inpost_courier
 *               shippingAddressId:
 *                 type: integer
 *                 example: 2
 *               privateInvoiceAddressId:
 *                 type: integer
 *                 example: 3
 *               wantInvoice:
 *                 type: boolean
 *                 example: true
 *               invoiceType:
 *                 type: string
 *                 example: company
 *               companyName:
 *                 type: string
 *                 example: Firma Sp. z o.o.
 *               companyNip:
 *                 type: string
 *                 example: 1234567890
 *               companyStreet:
 *                 type: string
 *                 example: Ulica Kwiatowa
 *               companyHouseNumber:
 *                 type: string
 *                 example: 15A
 *               companyPostalCode:
 *                 type: string
 *                 example: 00-001
 *               companyCity:
 *                 type: string
 *                 example: Warszawa
 *               productPrice:
 *                 type: number
 *                 format: float
 *                 example: 150.00
 *               shippingPrice:
 *                 type: number
 *                 format: float
 *                 example: 15.00
 *               paymentMethod:
 *                 type: string
 *                 example: payu
 *     responses:
 *       201:
 *         description: Zamówienie zostało utworzone
 *       400:
 *         description: Błąd walidacji danych
 *       500:
 *         description: Błąd serwera przy tworzeniu zamówienia
 */
router.post('/create', verifySession, OrdersController.createOrder);

router.post('/payu-callback', OrdersController.payuCallback);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Aktualizacja statusu zamówienia
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Aktualizuje status zamówienia o podanym ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID zamówienia
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Status zamówienia zaktualizowany
 *       404:
 *         description: Zamówienie nie znalezione
 *       500:
 *         description: Błąd serwera przy aktualizacji statusu
 */
router.put('/:id/status', verifySession, OrdersController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/payment-status:
 *   put:
 *     summary: Aktualizacja statusu płatności zamówienia
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Aktualizuje status płatności zamówienia
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID zamówienia
 *         schema:
 *           type: integer
 *           example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: paid
 *               transactionId:
 *                 type: string
 *                 example: "TX123456789"
 *     responses:
 *       200:
 *         description: Status płatności zaktualizowany
 *       404:
 *         description: Płatność nie znaleziona
 *       500:
 *         description: Błąd serwera przy aktualizacji płatności
 */
router.put('/:orderId/payment-status', verifySession, OrdersController.updatePaymentStatus);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Pobranie listy zamówień użytkownika
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Zwraca listę zamówień użytkownika o podanym ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID użytkownika
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista zamówień użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderNumber:
 *                         type: string
 *                         example: ORD-2505-4821
 *                       status:
 *                         type: string
 *                         example: shipped
 *       500:
 *         description: Błąd serwera przy pobieraniu zamówień
 */
router.get('/user/:userId', verifySession, OrdersController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Pobranie szczegółów zamówienia
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Pobiera szczegóły zamówienia na podstawie ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID zamówienia
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Szczegóły zamówienia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     orderNumber:
 *                       type: string
 *                       example: ORD-2505-4821
 *                     status:
 *                       type: string
 *                       example: shipped
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         name:
 *                           type: string
 *                           example: Produkt X
 *                         price:
 *                           type: number
 *                           format: float
 *                           example: 150.00
 *                     payment:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: paid
 *                         method:
 *                           type: string
 *                           example: credit_card
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: Jan Kowalski
 *                     shippingAddress:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         street:
 *                           type: string
 *                           example: Ulica Kwiatowa 15A
 *                         city:
 *                           type: string
 *                           example: Warszawa
 *       404:
 *         description: Zamówienie nie znalezione
 *       500:
 *         description: Błąd serwera przy pobieraniu zamówienia
 */
router.get('/:id', verifySession, OrdersController.getOrder);

module.exports = router;