const { Address } = require('../models');
const { verifySession } = require('../middleware/sessionMiddleware');

exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { street, houseNumber, city, postalCode, type, isDefault } = req.body;

        if (!/^\d{2}-\d{3}$/.test(postalCode)) {
            return res.status(400).json({
                success: false,
                message: 'Nieprawidłowy format kodu pocztowego (wymagany format: 00-000)'
            });
        }

        if (isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId, isDefault: true } }
            );
        }

        const address = await Address.create({
            userId,
            street,
            houseNumber,
            city,
            postalCode,
            type: type || 'both',
            isDefault: isDefault || false
        });

        return res.status(201).json({
            success: true,
            message: 'Adres został dodany',
            address
        });
    } catch (err) {
        console.error('Błąd przy dodawaniu adresu:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy dodawaniu adresu'
        });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { street, houseNumber, city, postalCode, type, isDefault } = req.body;

        const address = await Address.findOne({ where: { id, userId } });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono adresu'
            });
        }

        if (isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId, isDefault: true } }
            );
        }

        const updates = {
            street: street || address.street,
            houseNumber: houseNumber || address.houseNumber,
            city: city || address.city,
            postalCode: postalCode || address.postalCode,
            type: type || address.type,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault
        };

        await Address.update(updates, { where: { id, userId } });

        const updatedAddress = await Address.findOne({ where: { id } });

        return res.status(200).json({
            success: true,
            message: 'Adres został zaktualizowany',
            address: updatedAddress
        });
    } catch (err) {
        console.error('Błąd przy aktualizacji adresu:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy aktualizacji adresu'
        });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const address = await Address.findOne({ where: { id, userId } });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono adresu'
            });
        }

        await address.destroy();

        return res.status(200).json({
            success: true,
            message: 'Adres został usunięty'
        });
    } catch (err) {
        console.error('Błąd przy usuwaniu adresu:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd serwera przy usuwaniu adresu'
        });
    }
};