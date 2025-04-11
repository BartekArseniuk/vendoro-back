const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');
const Session = require('../models/Session');
const User = require('../models/User');

User.associate({ Session });
Session.associate({ User });

const verifySession = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Brak tokenu autoryzacyjnego'
            });
        }

        const session = await Session.findOne({
            where: { token },
            include: [{
                model: User,
                as: 'user',
                required: true
            }]
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Sesja wygasła lub nie istnieje'
            });
        }

        if (new Date() > new Date(session.expiresAt)) {
            await session.destroy();
            return res.status(401).json({
                success: false,
                message: 'Sesja wygasła'
            });
        }

        try {
            const decoded = jwt.verify(token, config.development.JWT_SECRET);

            req.user = session.user;
            req.session = session;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                await session.destroy();
                return res.status(401).json({
                    success: false,
                    message: 'Sesja wygasła'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Nieprawidłowy token'
            });
        }
    } catch (err) {
        console.error('Błąd weryfikacji sesji:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd weryfikacji sesji'
        });
    }
};

module.exports = {
    verifySession
};