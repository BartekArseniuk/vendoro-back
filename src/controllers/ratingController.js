const path = require('path');
const fs = require('fs');
const { Rating, User } = require('../models');
const leoProfanity = require('leo-profanity');

leoProfanity.loadDictionary();
const badWordsPath = path.join(__dirname, '../../config/bad-words.txt');
const badWords = fs.readFileSync(badWordsPath, 'utf-8')
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);
leoProfanity.add(badWords);

exports.addRating = async (req, res) => {
    try {
        const raterUserId = req.user.id;
        const { ratedUserId, rating, comment } = req.body;

        if (!ratedUserId || !rating) {
            return res.status(400).json({ success: false, message: 'Brakuje wymaganych danych' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Ocena musi być od 1 do 5' });
        }

        const existingRating = await Rating.findOne({ where: { raterUserId, ratedUserId } });
        if (existingRating) {
            return res.status(400).json({ success: false, message: 'Możesz ocenić tego użytkownika tylko raz.' });
        }

        const cleanComment = comment ? leoProfanity.clean(comment) : null;

        const newRating = await Rating.create({ raterUserId, ratedUserId, rating, comment: cleanComment });
        return res.status(201).json({ success: true, rating: newRating });
    } catch (err) {
        console.error('Błąd przy dodawaniu oceny:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera przy dodawaniu oceny' });
    }
};

exports.getMyRatings = async (req, res) => {
    try {
        const ratedUserId = req.user.id;
        const ratings = await Rating.findAll({
            where: { ratedUserId },
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['ratedUserId'] },
            include: [{
                model: User,
                as: 'raterUser',
                attributes: ['firstName', 'lastName', 'avatar']
            }]
        });
        return res.status(200).json({ success: true, ratings });
    } catch (err) {
        console.error('Błąd przy pobieraniu ocen użytkownika:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera przy pobieraniu ocen' });
    }
};

exports.updateRating = async (req, res) => {
    try {
        const raterUserId = req.user.id;
        const { ratingId } = req.params;
        const { rating, comment } = req.body;

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({ success: false, message: 'Ocena musi być od 1 do 5' });
        }

        const ratingToUpdate = await Rating.findOne({ where: { id: ratingId, raterUserId } });
        if (!ratingToUpdate) {
            return res.status(404).json({ success: false, message: 'Nie znaleziono oceny lub brak dostępu' });
        }

        const updates = {};
        if (rating !== undefined) updates.rating = rating;
        if (comment !== undefined) updates.comment = leoProfanity.clean(comment);

        await ratingToUpdate.update(updates);
        return res.status(200).json({ success: true, rating: ratingToUpdate });
    } catch (err) {
        console.error('Błąd przy aktualizacji oceny:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera przy aktualizacji oceny' });
    }
};

exports.deleteRating = async (req, res) => {
    try {
        const raterUserId = req.user.id;
        const { ratingId } = req.params;

        const ratingToDelete = await Rating.findOne({ where: { id: ratingId, raterUserId } });
        if (!ratingToDelete) {
            return res.status(404).json({ success: false, message: 'Nie znaleziono oceny lub brak dostępu' });
        }

        await ratingToDelete.destroy();
        return res.status(200).json({ success: true, message: 'Ocena została usunięta' });
    } catch (err) {
        console.error('Błąd przy usuwaniu oceny:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera przy usuwaniu oceny' });
    }
};

exports.hasRatedSeller = async (req, res) => {
    try {
        const raterUserId = req.user.id;
        const { sellerId } = req.params;

        if (!sellerId) {
            return res.status(400).json({ success: false, message: 'Brak ID sprzedawcy' });
        }

        const existingRating = await Rating.findOne({
            where: { raterUserId, ratedUserId: sellerId }
        });

        return res.status(200).json({ success: true, hasRated: !!existingRating });
    } catch (err) {
        console.error('Błąd przy sprawdzaniu oceny:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }
};