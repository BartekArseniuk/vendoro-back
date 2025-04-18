const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     summary: Dodaj nowy adres
 *     tags: 
 *      - Addresses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - houseNumber
 *               - city
 *               - postalCode
 *             properties:
 *               street:
 *                 type: string
 *                 example: "Aleja Jerozolimskie"
 *               houseNumber:
 *                 type: string
 *                 example: "123"
 *               city:
 *                 type: string
 *                 example: "Warszawa"
 *               postalCode:
 *                 type: string
 *                 example: "00-001"
 *               type:
 *                 type: string
 *                 enum: [shipping, billing, both]
 *                 default: both
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Adres został dodany
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Nieprawidłowe dane wejściowe
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera
 */
router.post('/', verifySession, addressController.addAddress);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   put:
 *     summary: Aktualizuj adres
 *     tags: 
 *      - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID adresu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               houseNumber:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [shipping, billing, both]
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Adres zaktualizowany
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 address:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Nieprawidłowe dane wejściowe
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono adresu
 *       500:
 *         description: Błąd serwera
 */
router.put('/:id', verifySession, addressController.updateAddress);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   delete:
 *     summary: Usuń adres
 *     tags: 
 *      - Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID adresu
 *     responses:
 *       200:
 *         description: Adres usunięty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Nie znaleziono adresu
 *       500:
 *         description: Błąd serwera
 */
router.delete('/:id', verifySession, addressController.deleteAddress);

module.exports = router;