const express = require('express');
const path = require('path');
const router = express.Router();
const registerController = require('../controllers/auth/registerController');
const loginController = require('../controllers/auth/loginController');
const userController = require('../controllers/auth/userController');
const verifyEmailController = require('../controllers/auth/verifyEmailController');
const resetPasswordController = require('../controllers/auth/resetPasswordController');

const { verifySession } = require('../middleware/sessionMiddleware');

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Rejestracja użytkownika
 *     tags: 
 *       - Authorization
 *     description: Tworzy nowego użytkownika w systemie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jan
 *               lastName:
 *                 type: string
 *                 example: Kowalski
 *               email:
 *                 type: string
 *                 example: jan.kowalski@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: Użytkownik zarejestrowany pomyślnie
 *       400:
 *         description: Błąd walidacji lub użytkownik już istnieje
 */
router.post('/register', registerController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: 
 *       - Authorization
 *     description: Loguje użytkownika i zwraca token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jan.kowalski@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Logowanie udane, zwraca token JWT
 *       400:
 *         description: Nieprawidłowy email lub hasło
 */
router.post('/login', loginController.loginUser);

/**
 * @swagger
 * /api/users/verify/{token}:
 *   get:
 *     summary: Weryfikacja e-maila użytkownika
 *     tags: 
 *       - Authorization
 *     description: Weryfikuje e-mail użytkownika na podstawie tokena
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token weryfikacyjny wysłany w e-mailu
 *         schema:
 *           type: string
 *           example: abc123token
 *     responses:
 *       200:
 *         description: Konto zostało zweryfikowane pomyślnie
 *       400:
 *         description: Błąd weryfikacji lub nieprawidłowy token
 */
router.get('/verify/:token', verifyEmailController.verifyEmail);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Wysłanie linku do resetu hasła
 *     tags: 
 *       - Authorization
 *     description: Wysyła e-mail z linkiem do resetu hasła na podany adres e-mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: jan.kowalski@example.com
 *     responses:
 *       200:
 *         description: E-mail z linkiem do resetu hasła został wysłany
 *       400:
 *         description: Nie znaleziono użytkownika lub nieprawidłowy adres e-mail
 *       500:
 *         description: Błąd podczas wysyłania e-maila
 */
router.post('/reset-password', resetPasswordController.requestPasswordReset);

/**
 * @swagger
 * /api/users/update-password:
 *   post:
 *     summary: Resetowanie hasła użytkownika
 *     tags: 
 *       - Authorization
 *     description: Umożliwia użytkownikowi ustawienie nowego hasła po kliknięciu w link resetujący
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT przesłany w e-mailu resetującym
 *               password:
 *                 type: string
 *                 description: Nowe hasło użytkownika
 *               confirmPassword:
 *                 type: string
 *                 description: Powtórzone hasło dla weryfikacji
 *     responses:
 *       200:
 *         description: Hasło zostało zaktualizowane pomyślnie
 *       400:
 *         description: Niepoprawne dane lub błąd walidacji
 *       500:
 *         description: Błąd serwera
 */
router.post('/update-password', resetPasswordController.updatePassword);

router.get('/reset-password/:token', resetPasswordController.renderResetPasswordForm);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Wylogowanie użytkownika
 *     tags: 
 *       - Authorization
 *     description: Wylogowuje użytkownika poprzez usunięcie sesji z bazy danych
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wylogowano pomyślnie
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
 *                   example: Wylogowano pomyślnie
 *       401:
 *         description: Brak autoryzacji lub nieprawidłowy token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Brak aktywnej sesji
 *       500:
 *         description: Błąd serwera podczas wylogowywania
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Błąd podczas wylogowywania
 */
router.post('/logout', verifySession, loginController.logoutUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Pobranie danych aktualnie zalogowanego użytkownika
 *     tags: 
 *       - Authorization
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