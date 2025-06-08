const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifySession } = require('../middleware/sessionMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');

/**
 * @swagger
 * /api/ratings/rate:
 *   post:
 *     summary: Dodaj nową ocenę użytkownika
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ratedUserId
 *               - rating
 *             properties:
 *               ratedUserId:
 *                 type: integer
 *                 example: 5
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Bardzo dobry użytkownik!
 *     responses:
 *       201:
 *         description: Ocena została dodana pomyślnie
 *       400:
 *         description: Brak wymaganych danych lub nieprawidłowa ocena
 *       500:
 *         description: Błąd serwera
 */
router.post('/rate', verifySession, ratingController.addRating);

/**
 * @swagger
 * /api/ratings/user/{userId}:
 *   get:
 *     summary: Pobierz oceny dla danego użytkownika
 *     tags:
 *       - Ratings
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ocenianego użytkownika
 *     responses:
 *       200:
 *         description: Lista ocen użytkownika
 *       500:
 *         description: Błąd serwera
 */
router.get('/user/:userId', verifySession, ratingController.getRatingsForUser);

/**
 * @swagger
 * /api/ratings/{ratingId}:
 *   put:
 *     summary: Aktualizuj ocenę
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID oceny do aktualizacji
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Zmieniona treść komentarza
 *     responses:
 *       200:
 *         description: Ocena została zaktualizowana
 *       400:
 *         description: Nieprawidłowa wartość oceny
 *       404:
 *         description: Ocena nie znaleziona lub brak dostępu
 *       500:
 *         description: Błąd serwera
 */
router.put('/:ratingId', verifyAdmin, verifySession, ratingController.updateRating);

/**
 * @swagger
 * /api/ratings/{ratingId}:
 *   delete:
 *     summary: Usuń ocenę
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID oceny do usunięcia
 *     responses:
 *       200:
 *         description: Ocena została usunięta
 *       404:
 *         description: Ocena nie znaleziona lub brak dostępu
 *       500:
 *         description: Błąd serwera
 */
router.delete('/:ratingId', verifyAdmin, verifySession, ratingController.deleteRating);

/**
 * @swagger
 * /api/ratings/has-rated/{sellerId}:
 *   get:
 *     summary: Sprawdź, czy aktualny użytkownik ocenił danego sprzedawcę
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sprzedawcy
 *     responses:
 *       200:
 *         description: Informacja czy użytkownik już ocenił
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 hasRated:
 *                   type: boolean
 *       400:
 *         description: Brak ID sprzedawcy
 *       500:
 *         description: Błąd serwera
 */
router.get('/has-rated/:sellerId', verifySession, ratingController.hasRatedSeller);

module.exports = router;