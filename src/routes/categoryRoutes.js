const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

/**
 * @swagger
 * /api/categories/create:
 *   post:
 *     summary: Tworzenie nowej kategorii
 *     tags:
 *       - Categories
 *     description: Tworzy nową kategorię w systemie
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
 *     responses:
 *       201:
 *         description: Kategoria została utworzona pomyślnie
 *       400:
 *         description: Błąd walidacji danych
 */
router.post('/create', CategoryController.createCategory);

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
 *     description: Umożliwia aktualizację nazwy lub opisu kategorii
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID kategorii
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
 *                 example: Komputery
 *               description:
 *                 type: string
 *                 example: Kategoria zawierająca komputery
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
router.put('/:id', CategoryController.updateCategory);

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
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;