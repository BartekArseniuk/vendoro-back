const { User, Address, Session } = require('../models');
const sequelize = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../services/emailService');
const config = require('../../config/config.json');

exports.getCurrentUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono użytkownika'
            });
        }

        // Pobierz użytkownika wraz z adresami
        const userWithAddresses = await User.findByPk(user.id, {
            attributes: ['id', 'email', 'phone', 'firstName', 'lastName', 'avatar', 'isVerified'],
            include: [{
                model: Address,
                as: 'addresses',
                attributes: ['id', 'street', 'houseNumber', 'city', 'postalCode', 'type', 'isDefault'],
                order: [
                    [sequelize.literal("CASE WHEN type = 'billing' THEN 0 WHEN type = 'both' THEN 1 ELSE 2 END"), 'ASC'],
                    ['isDefault', 'DESC'],
                    ['city', 'ASC'],
                    ['street', 'ASC']
                ]
            }]
        });

        return res.status(200).json({
            success: true,
            user: {
                id: userWithAddresses.id,
                email: userWithAddresses.email,
                phone: userWithAddresses.phone,
                firstName: userWithAddresses.firstName,
                lastName: userWithAddresses.lastName,
                avatar: userWithAddresses.avatar,
                isVerified: userWithAddresses.isVerified,
                addresses: userWithAddresses.addresses || []
            }
        });
    } catch (err) {
        console.error('Błąd przy pobieraniu użytkownika:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy pobieraniu użytkownika'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono użytkownika'
            });
        }

        await Session.destroy({ where: { userId: user.id } });
        await User.destroy({ where: { id: user.id } });

        return res.status(200).json({
            success: true,
            message: 'Konto zostało usunięte'
        });
    } catch (err) {
        console.error('Błąd przy usuwaniu konta:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy usuwaniu konta'
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = req.user;
        const { firstName, lastName, email, phone, password, avatar } = req.body;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono użytkownika'
            });
        }

        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (avatar) updates.avatar = avatar;
        if (phone) updates.phone = phone;

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Podany email jest już zajęty' });
            }
            updates.email = email;
            updates.isVerified = false;

            const verificationToken = jwt.sign({ id: user.id }, config.development.JWT_SECRET, { expiresIn: '24h' });
            await sendVerificationEmail(email, verificationToken);
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'Hasło musi mieć co najmniej 8 znaków' });
            }
            updates.password = await bcrypt.hash(password, 10);
            updates.passwordChangedAt = new Date();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nie podano danych do aktualizacji'
            });
        }

        await User.update(updates, { where: { id: user.id } });

        const updatedUser = await User.findOne({ where: { id: user.id } });

        return res.status(200).json({
            success: true,
            message: 'Dane użytkownika zostały zaktualizowane',
            user: {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
            }
        });
    } catch (err) {
        console.error('Błąd przy aktualizacji użytkownika:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy aktualizacji użytkownika'
        });
    }
};