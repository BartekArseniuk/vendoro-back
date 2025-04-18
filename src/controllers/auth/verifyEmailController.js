const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const config = require('../../../config/config.json');
const path = require('path');

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, config.development.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.render('verificationResultTemplate', { 
        status: 400, 
        message: 'Nieprawidłowy token', 
        statusType: 'error' 
      });
    }

    if (user.isVerified) {
      return res.render('verificationResultTemplate', { 
        status: 200, 
        message: 'Konto zostało już zweryfikowane', 
        statusType: 'warning' 
      });
    }

    user.isVerified = true;
    await user.save();

    return res.render('verificationResultTemplate', { 
      status: 200, 
      message: 'Konto zostało zweryfikowane. Możesz się teraz zalogować.', 
      statusType: 'success' 
    });

  } catch (error) {
    console.error(error);

    if (error.name === 'TokenExpiredError') {
      return res.render('verificationResultTemplate', { 
        status: 400, 
        message: 'Link weryfikacyjny wygasł. Proszę zażądać nowego linku.', 
        statusType: 'error' 
      });
    }

    return res.render('verificationResultTemplate', { 
      status: 400, 
      message: 'Błąd weryfikacji lub nieprawidłowy token.', 
      statusType: 'error' 
    });
  }
};