const { Address } = require('../models');

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

        let finalIsDefault = false;
        if (type === 'shipping' || type === 'both') {
            finalIsDefault = isDefault || true;
        }

        if (type !== 'shipping' && type !== 'both') {
            finalIsDefault = false;
        }

        if (finalIsDefault) {
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
            isDefault: finalIsDefault || false
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

        let finalIsDefault = false;
        if (type === 'shipping' || type === 'both') {
            finalIsDefault = isDefault || true;
        }

        if (type !== 'shipping' && type !== 'both') {
            finalIsDefault = false;
        }

        if (finalIsDefault) {
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
            isDefault: finalIsDefault !== undefined ? finalIsDefault : address.isDefault
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

        const wasDefault = address.isDefault;

        await address.destroy();
        
        if (wasDefault) {
            let newDefault = await Address.findOne({
                where: { userId, type: 'shipping' },
                order: [['createdAt', 'DESC']]
            });

            if (!newDefault) {
                newDefault = await Address.findOne({
                    where: { userId, type: 'both' },
                    order: [['createdAt', 'DESC']]
                });
            }

            if (newDefault) {
                await newDefault.update({ isDefault: true });
            }
        }

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