const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/auth/userController');

const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Pobranie danych aktualnie zalogowanego użytkownika
 *     tags: 
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dane zalogowanego użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *       401:
 *         description: Brak ważnej sesji lub tokenu
 */
router.get('/me', verifySession, userController.getCurrentUser);


/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Usunięcie konta użytkownika
 *     tags: 
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Konto zostało pomyślnie usunięte
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
 *         description: Brak ważnej sesji lub tokenu
 *       404:
 *         description: Nie znaleziono użytkownika
 *       500:
 *         description: Błąd serwera podczas usuwania konta
 */
router.delete('/me', verifySession, userController.deleteUser);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Aktualizacja danych użytkownika
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dane zaktualizowane pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Nieprawidłowe dane wejściowe
 *       401:
 *         description: Brak ważnej sesji lub tokenu
 *       404:
 *         description: Nie znaleziono użytkownika
 *       500:
 *         description: Błąd serwera
 */
router.put('/me', verifySession, userController.updateUser);

module.exports = router;