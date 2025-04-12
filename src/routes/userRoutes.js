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

module.exports = router;