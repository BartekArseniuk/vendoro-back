const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Wyszukiwanie produktów po nazwie lub opisie
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: laptop
 *     responses:
 *       200:
 *         description: Lista dopasowanych produktów
 *       400:
 *         description: Brak frazy
 *       500:
 *         description: Błąd serwera
 */
router.get('/search', ProductController.searchProducts);

/**
 * @swagger
 * /api/products/latest:
 *   get:
 *     summary: Pobranie 12 najnowszych produktów
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista produktów
 *       500:
 *         description: Błąd serwera
 */
router.get('/latest', ProductController.getLatestProducts);

/**
 * @swagger
 * /api/products/liked:
 *   get:
 *     summary: Produkty polubione przez użytkownika
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista produktów
 *       401:
 *         description: Nieautoryzowany dostęp
 *       500:
 *         description: Błąd serwera
 */
router.get('/liked', verifySession, ProductController.getLikedProducts);

/**
 * @swagger
 * /api/products/user:
 *   get:
 *     summary: Produkty zalogowanego użytkownika
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista produktów
 *       500:
 *         description: Błąd serwera
 */
router.get('/user', verifySession, ProductController.getProductsByLoggedInUser);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Produkty z danej kategorii
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista produktów
 *       500:
 *         description: Błąd serwera
 */
router.get('/category/:categoryId', ProductController.getProductsByCategoryId);

/**
 * @swagger
 * /api/products/recommended:
 *   get:
 *     summary: Polecane dla Ciebie (lub Trending dla niezalogowanych)
 *     description: >
 *       Zwraca do 12 produktów. Dla zalogowanego użytkownika lista
 *       personalizowana na podstawie polubień i/lub jego ofert.
 *       Dla niezalogowanego zwracane są produkty trending (najwięcej polubień + świeże).
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []   # auth jest opcjonalny – jeśli brak tokena, zwracany jest fallback Trending
 *     responses:
 *       200:
 *         description: Lista polecanych/trending produktów
 *       500:
 *         description: Błąd serwera
 */
router.get('/recommended', ProductController.getRecommendedForUser);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Szczegóły produktu
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Szczegóły produktu
 *       404:
 *         description: Nie znaleziono
 *       500:
 *         description: Błąd serwera
 */
router.get('/:id', ProductController.getProductById);

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Tworzenie nowego produktu
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - price
 *               - categoryId
 *               - deliveryMethod
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               condition:
 *                 type: string
 *               deliveryMethod:
 *                 type: string
 *               sharePhoneNumber:
 *                 type: boolean
 *               photo1:
 *                 type: string
 *               photo2:
 *                 type: string
 *               photo3:
 *                 type: string
 *               photo4:
 *                 type: string
 *               photo5:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produkt utworzony
 *       400:
 *         description: Błąd walidacji
 *       500:
 *         description: Błąd serwera
 */
router.post('/create', verifySession, ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Aktualizacja produktu
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *               - location
 *               - price
 *               - categoryId
 *               - deliveryMethod
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               condition:
 *                 type: string
 *               deliveryMethod:
 *                 type: string
 *               sharePhoneNumber:
 *                 type: boolean
 *               photo1:
 *                 type: string
 *               photo2:
 *                 type: string
 *               photo3:
 *                 type: string
 *               photo4:
 *                 type: string
 *               photo5:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               isSold:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Produkt zaktualizowany
 *       400:
 *         description: Błąd walidacji
 *       401:
 *         description: Brak dostępu
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd serwera
 */
router.put('/:id', verifySession, ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Usunięcie produktu
 *     tags: [Products]
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
 *         description: Produkt usunięty
 *       401:
 *         description: Brak dostępu
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd serwera
 */
router.delete('/:id', verifySession, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{productId}/like:
 *   post:
 *     summary: Polubienie lub odlubienie produktu
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Polubienie usunięte
 *       201:
 *         description: Produkt polubiony
 *       401:
 *         description: Nieautoryzowany dostęp
 *       500:
 *         description: Błąd serwera
 */
router.post('/:productId/like', verifySession, ProductController.toggleLike);

module.exports = router;