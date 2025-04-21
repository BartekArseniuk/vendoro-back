const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

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
 */
router.post('/create', ProductController.createProduct);

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
 *               userId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produkt został zaktualizowany
 *       404:
 *         description: Produkt nie znaleziony
 *       500:
 *         description: Błąd przy aktualizacji produktu
 */
router.put('/:id', ProductController.updateProduct);

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
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;