const User = require('../../models/User');
const Session = require('../../models/Session');

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
                lastName: user.lastName,
                avatar: user.avatar,
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