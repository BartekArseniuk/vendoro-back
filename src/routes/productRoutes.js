const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/products/latest:
 *   get:
 *     summary: Pobranie 12 najnowszych produktów
 *     tags:
 *       - Products
 *     description: Zwraca 12 najnowszych produktów posortowanych malejąco według daty utworzenia
 *     responses:
 *       200:
 *         description: Lista 12 najnowszych produktów
 *       500:
 *         description: Błąd przy pobieraniu najnowszych produktów
 */
router.get('/latest', ProductController.getLatestProducts);

/**
 * @swagger
 * /api/products/liked:
 *   get:
 *     summary: Pobranie produktów polubionych przez zalogowanego użytkownika
 *     tags:
 *       - Products
 *     description: Zwraca listę produktów, które użytkownik polubił
 *     responses:
 *       200:
 *         description: Lista polubionych produktów
 *       401:
 *         description: Nieautoryzowany dostęp
 *       500:
 *         description: Błąd przy pobieraniu polubionych produktów
 */
router.get('/liked', verifySession, ProductController.getLikedProducts);

/**
 * @swagger
 * /api/products/user/{userId}:
 *   get:
 *     summary: Pobranie produktów użytkownika
 *     tags:
 *       - Products
 *     description: Zwraca listę produktów dodanych przez danego użytkownika
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
 *         description: Lista produktów użytkownika
 *       500:
 *         description: Błąd przy pobieraniu produktów
 */
router.get('/user/:userId', ProductController.getProductsByUserId);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Pobranie produktów według kategorii
 *     tags:
 *       - Products
 *     description: Zwraca listę produktów przypisanych do danej kategorii
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID kategorii
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista produktów z danej kategorii
 *       500:
 *         description: Błąd przy pobieraniu produktów
 */
router.get('/category/:categoryId', ProductController.getProductsByCategoryId);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Pobranie szczegółów produktu
 *     tags:
 *       - Products
 *     description: Pobiera szczegóły produktu na podstawie ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Zwraca szczegóły produktu
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd przy pobieraniu produktu
 */
router.get('/:id', ProductController.getProductById);

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Tworzenie nowego produktu
 *     tags:
 *       - Products
 *     description: Tworzy nowy produkt w systemie
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
 *               - userId
 *               - categoryId
 *               - deliveryMethod
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 example: Nowoczesny laptop gamingowy
 *               location:
 *                 type: string
 *                 example: Warszawa
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 3000.00
 *               condition:
 *                 type: string
 *                 example: new
 *               deliveryMethod:
 *                 type: string
 *                 example: both
 *               sharePhoneNumber:
 *                 type: boolean
 *                 example: true
 *               photo1:
 *                 type: string
 *                 example: photo1.jpg
 *               photo2:
 *                 type: string
 *                 example: photo2.jpg
 *               photo3:
 *                 type: string
 *                 example: photo3.jpg
 *               photo4:
 *                 type: string
 *                 example: photo4.jpg
 *               photo5:
 *                 type: string
 *                 example: photo5.jpg
 *               userId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Produkt został pomyślnie stworzony
 *       400:
 *         description: Błąd walidacji lub użytkownik/kategoria nie istnieje
 *       500:
 *         description: Błąd przy tworzeniu produktu
 */
router.post('/create', verifySession, ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Aktualizacja produktu
 *     tags:
 *       - Products
 *     description: Umożliwia aktualizację szczegółów produktu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *           example: 1
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
 *               - userId
 *               - categoryId
 *               - deliveryMethod
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop Gamingowy
 *               description:
 *                 type: string
 *                 example: Nowoczesny laptop gamingowy z dużym dyskiem
 *               location:
 *                 type: string
 *                 example: Wrocław
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 3500.00
 *               condition:
 *                 type: string
 *                 example: new
 *               deliveryMethod:
 *                 type: string
 *                 example: both
 *               sharePhoneNumber:
 *                 type: boolean
 *                 example: false
 *               photo1:
 *                 type: string
 *                 example: new_photo1.jpg
 *               photo2:
 *                 type: string
 *                 example: new_photo2.jpg
 *               photo3:
 *                 type: string
 *                 example: new_photo3.jpg
 *               photo4:
 *                 type: string
 *                 example: new_photo4.jpg
 *               photo5:
 *                 type: string
 *                 example: new_photo5.jpg
 *               userId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produkt został zaktualizowany
 *       400:
 *         description: Błąd walidacji
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd przy aktualizacji produktu
 */
router.put('/:id', verifySession, ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Usunięcie produktu
 *     tags:
 *       - Products
 *     description: Usuwa produkt na podstawie ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Produkt został usunięty
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd przy usuwaniu produktu
 */
router.delete('/:id', verifySession, ProductController.deleteProduct);

/**
 * @swagger
 * /api/products/{productId}/like:
 *   post:
 *     summary: Polubienie lub odlubienie produktu
 *     tags:
 *       - Products
 *     description: Dodaje lub usuwa polubienie produktu przez zalogowanego użytkownika
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID produktu
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Polubienie usunięte
 *       201:
 *         description: Produkt polubiony
 *       401:
 *         description: Nieautoryzowany dostęp
 *       500:
 *         description: Błąd podczas zmiany stanu polubienia
 */
router.post('/:productId/like', verifySession, ProductController.toggleLike);

module.exports = router;