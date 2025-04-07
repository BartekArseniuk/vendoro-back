const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');
const config = require('../../config/config.json');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
    }
    if (firstName.length > 255 || lastName.length > 255 || email.length > 255) {
      return res.status(400).json({ message: 'Imię, nazwisko i email nie mogą przekroczyć 255 znaków' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Hasło musi mieć co najmniej 8 znaków' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const verificationToken = jwt.sign({ id: newUser.id }, config.development.JWT_SECRET, { expiresIn: '24h' });

    await sendVerificationEmail(newUser.email, verificationToken);

    return res.status(201).json({
      message: 'Rejestracja zakończona sukcesem. Sprawdź e-mail, aby aktywować konto.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Błąd podczas rejestracji' });
  }
};