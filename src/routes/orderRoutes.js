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
 *     description: Tworzy nowe zamówienie na podstawie przesłanych danych. Użytkownik jest pobierany z sesji.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - shippingMethod
 *               - shippingAddressId
 *               - productPrice
 *               - shippingPrice
 *               - paymentMethod
 *             properties:
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

/**
 * @swagger
 * /api/orders/payu-callback:
 *   post:
 *     summary: Callback od PayU
 *     tags:
 *       - Orders
 *     description: Przetwarza odpowiedź zwrotną z PayU
 *     responses:
 *       200:
 *         description: Callback przetworzony
 *       400:
 *         description: Niepoprawne dane
 *       500:
 *         description: Błąd serwera
 */
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID zamówienia
 *         schema:
 *           type: integer
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
 *         description: Błąd serwera
 */
router.put('/:id/status', verifySession, OrdersController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/payment-status:
 *   put:
 *     summary: Aktualizacja statusu płatności
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: TX123456789
 *     responses:
 *       200:
 *         description: Status płatności zaktualizowany
 *       404:
 *         description: Płatność nie znaleziona
 *       500:
 *         description: Błąd serwera
 */
router.put('/:orderId/payment-status', verifySession, OrdersController.updatePaymentStatus);

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Lista zamówień aktualnie zalogowanego użytkownika
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista zamówień
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderNumber:
 *                         type: string
 *                         example: ORD-2506-1234
 *                       status:
 *                         type: string
 *                         example: shipped
 *                       totalPrice:
 *                         type: number
 *                         format: float
 *                         example: 189.99
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-29T14:32:00Z
 *                       productName:
 *                         type: string
 *                         example: "Koszula męska premium"
 *       500:
 *         description: Błąd serwera
 */
router.get('/user', verifySession, OrdersController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Pobierz szczegóły zamówienia
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       404:
 *         description: Zamówienie nie znalezione
 *       500:
 *         description: Błąd serwera
 */
router.get('/:id', verifySession, OrdersController.getOrder);

module.exports = router;