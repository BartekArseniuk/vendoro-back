const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config.json');
const User = require('../models/User');

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email i hasło są wymagane' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Błędny email lub hasło' });
    }

    // if (!user.isVerified) {
    //   return res.status(400).json({ message: 'Please verify your email' });
    // }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Błędny email lub hasło' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.development.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Logowanie przebugło pomyślnie',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error logging in' });
  }
};