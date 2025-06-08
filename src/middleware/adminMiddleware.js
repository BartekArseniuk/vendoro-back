const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');
const { Session, User } = require('../models');

const verifyAdmin = async (req, res, next) => {
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
                required: true,
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

        let decoded;
        try {
            decoded = jwt.verify(token, config.development.JWT_SECRET);
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

        if (session.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Brak uprawnień administratora'
            });
        }

        req.user = session.user;
        req.session = session;
        next();
        
    } catch (err) {
        console.error('Błąd weryfikacji admina:', err);
        return res.status(500).json({
            success: false,
            message: 'Błąd weryfikacji uprawnień'
        });
    }
};

module.exports = {
    verifyAdmin
};