const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { verifyAdmin } = require('../middleware/adminMiddleware');

/**
 * @swagger
 * /api/categories/create:
 *   post:
 *     summary: Tworzenie nowej kategorii
 *     tags:
 *       - Categories
 *     description: >
 *       Tworzy nową kategorię w systemie.  
 *       - Możesz podać własny `imageUrl`.  
 *       - Jeśli nie podasz `imageUrl`, a dodasz query param `?autoImage=true`, serwer spróbuje pobrać obraz z Unsplash na podstawie nazwy kategorii.
 *     parameters:
 *       - in: query
 *         name: autoImage
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Automatyczne pobranie obrazu z Unsplash, jeśli `imageUrl` nie podano.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Elektronika
 *               description:
 *                 type: string
 *                 example: Kategoria zawierająca produkty elektroniczne
 *               icon:
 *                 type: string
 *                 example: "💻"
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-123456"
 *     responses:
 *       201:
 *         description: Kategoria została utworzona pomyślnie
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/create', verifyAdmin, CategoryController.createCategory);

/**
 * @swagger
 * /api/categories/all:
 *   get:
 *     summary: Pobranie wszystkich kategorii
 *     tags:
 *       - Categories
 *     description: Pobiera listę wszystkich dostępnych kategorii
 *     responses:
 *       200:
 *         description: Zwraca listę wszystkich kategorii
 *       500:
 *         description: Błąd przy pobieraniu kategorii
 */
router.get('/all', CategoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Pobranie pojedynczej kategorii
 *     tags:
 *       - Categories
 *     description: Pobiera szczegóły jednej kategorii na podstawie jej ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID kategorii
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Zwraca szczegóły kategorii
 *       404:
 *         description: Kategoria nie znaleziona
 *       500:
 *         description: Błąd przy pobieraniu kategorii
 */
router.get('/:id', CategoryController.getCategoryById);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Aktualizacja kategorii
 *     tags:
 *       - Categories
 *     description: >
 *       Aktualizuje istniejącą kategorię.  
 *       - Możesz podać nowy `imageUrl`.  
 *       - Jeśli nie podasz `imageUrl`, a dodasz query param `?autoImage=true`, serwer spróbuje pobrać obraz z Unsplash na podstawie nazwy kategorii.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID kategorii
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: autoImage
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Automatyczne pobranie obrazu z Unsplash, jeśli `imageUrl` nie podano.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Komputery
 *               description:
 *                 type: string
 *                 example: Kategoria zawierająca komputery
 *               icon:
 *                 type: string
 *                 example: "💻"
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-654321"
 *     responses:
 *       200:
 *         description: Kategoria została zaktualizowana
 *       400:
 *         description: Błąd walidacji danych
 *       404:
 *         description: Kategoria nie znaleziona
 *       500:
 *         description: Błąd przy aktualizacji kategorii
 */
router.put('/:id', verifyAdmin, CategoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Usuwanie kategorii
 *     tags:
 *       - Categories
 *     description: Usuwa kategorię na podstawie jej ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID kategorii
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Kategoria została usunięta
 *       404:
 *         description: Kategoria nie znaleziona
 *       500:
 *         description: Błąd przy usuwaniu kategorii
 */
router.delete('/:id', verifyAdmin, CategoryController.deleteCategory);

module.exports = router;