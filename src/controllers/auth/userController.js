const User = require('../../models/User');

exports.getCurrentUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Nie znaleziono użytkownika'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
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