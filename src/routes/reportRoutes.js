const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Zgłoś opinię/produkt/użytkownika
 *     description: Tworzy zgłoszenie do moderacji. Zgłaszający otrzymuje mail potwierdzający.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - entityId
 *               - reason
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [rating, product, user]
 *                 example: rating
 *               entityId:
 *                 type: integer
 *                 example: 123
 *               reason:
 *                 type: string
 *                 enum: [abuse, spam, hate, nsfw, fraud, other]
 *                 example: abuse
 *               details:
 *                 type: string
 *                 description: Opcjonalny opis uzasadniający zgłoszenie
 *                 example: "Obraźliwy komentarz naruszający regulamin."
 *     responses:
 *       201:
 *         description: Zgłoszenie przyjęte
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Zgłoszenie przyjęte. Dziękujemy!"
 *                 report:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 45
 *                     status:
 *                       type: string
 *                       enum: [new, in_review, resolved, rejected]
 *                       example: new
 *                     entityType:
 *                       type: string
 *                       enum: [rating, product, user]
 *                       example: rating
 *                     entityId:
 *                       type: integer
 *                       example: 123
 *                     reason:
 *                       type: string
 *                       enum: [abuse, spam, hate, nsfw, fraud, other]
 *                       example: abuse
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Nieprawidłowe dane wejściowe
 *       401:
 *         description: Brak autoryzacji
 *       404:
 *         description: Zgłaszany obiekt nie istnieje
 *       500:
 *         description: Błąd serwera
 */
router.post('/', verifySession, reportController.createReport);

module.exports = router;
