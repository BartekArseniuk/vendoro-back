const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../services/emailService');
const config = require('../../config/config.json');
const bcrypt = require('bcrypt');

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Adres e-mail jest wymagany' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Nie znaleziono użytkownika z podanym adresem e-mail' });
        }

        const resetToken = jwt.sign({ id: user.id }, config.development.JWT_SECRET, { expiresIn: '1h' });

        await sendResetPasswordEmail(user.email, resetToken);

        return res.status(200).json({ message: 'Wysłano e-mail z linkiem do resetu hasła' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Błąd podczas wysyłania e-maila resetującego hasło' });
    }
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, config.development.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({ message: 'Nieprawidłowy lub wygasły token' });
        }

        if (user.passwordChangedAt) {
            const tokenIssuedAt = new Date(decoded.iat * 1000);
            if (user.passwordChangedAts > tokenIssuedAt) {
                return res.status(400).json({ message: 'Token został unieważniony przez zmianę hasła' });
            }
        }

        return res.status(200).json({ message: 'Token poprawny', token });
    } catch (err) {
        return res.status(400).json({ message: 'Nieprawidłowy lub wygasły token' });
    }
};

exports.updatePassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    try {
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Hasła nie są identyczne' });
        }

        const decoded = jwt.verify(token, config.development.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(400).json({ message: 'Nie znaleziono użytkownika' });
        }

        if (user.passwordChangedAt) {
            const tokenIssuedAt = new Date(decoded.iat * 1000);
            if (user.passwordChangedAt > tokenIssuedAt) {
                return res.status(400).json({ message: 'Token został unieważniony przez zmianę hasła' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordChangedAt = new Date();
        await user.save();

        return res.status(200).json({ message: 'Hasło zostało zaktualizowane' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Błąd podczas resetowania hasła' });
    }
};

exports.renderResetPasswordForm = async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) {
            console.log("Brak tokenu w URL");
            return res.status(400).render("resetPasswordForm", { token: null, error: "Brak tokenu" });
        }

        const decoded = jwt.verify(token, config.development.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(400).render("resetPasswordForm", { token: null, error: "Nieprawidłowy token" });
        }

        if (user.passwordChangedAt) {
            const tokenIssuedAt = new Date(decoded.iat * 1000);
            if (new Date(user.passwordChangedAt) > tokenIssuedAt) {
                return res.status(400).render("resetPasswordForm", { token: null, error: "Token unieważniony przez zmianę hasła" });
            }
        }

        res.render("resetPasswordForm", { token, error: null });
    } catch (err) {
        return res.status(400).render("resetPasswordForm", { token: null, error: "Nieprawidłowy lub wygasły token" });
    }
};