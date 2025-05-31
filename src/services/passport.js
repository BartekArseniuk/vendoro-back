const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const config = require('../../config/config.json');
const axios = require('axios');

const { sendGoogleWelcomeEmail } = require('./emailService');

passport.use(new GoogleStrategy({
    clientID: config.development.GOOGLE_CLIENT_ID,
    clientSecret: config.development.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/users/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            let user = await User.findOne({ where: { email } });

            // Pobierz avatar jako czysty base64
            let avatarBase64 = null;
            try {
                const avatarUrl = profile.photos[0].value;
                const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });

                avatarBase64 = Buffer.from(response.data, 'binary').toString('base64');
            } catch (avatarErr) {
                console.warn('Nie udało się pobrać avatara z Google:', avatarErr.message);
            }

            if (!user) {
                user = await User.create({
                    email: email,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    avatar: avatarBase64,
                    isVerified: true,
                    password: null
                });

                try {
                    await sendGoogleWelcomeEmail(email);
                } catch (emailErr) {
                    console.error('Błąd podczas wysyłania emaila powitalnego:', emailErr);
                }
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
});