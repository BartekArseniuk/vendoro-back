const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const config = require('../../config/config.json');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.development.EMAIL_USER,
    pass: config.development.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (userEmail, token) => {
  const verificationLink = `${config.development.BASE_URL}/api/users/verify/${token}`;

  const htmlContent = await ejs.renderFile(path.join(__dirname, '../views/verificationEmailTemplate.ejs'), { verificationLink });

  const mailOptions = {
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Potwierdź swoje konto',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (userEmail, token) => {
  const resetPasswordLink = `${config.development.BASE_URL}/api/users/reset-password/${token}`;

  const htmlContent = await ejs.renderFile(path.join(__dirname, '../views/resetPasswordEmailTemplate.ejs'), { resetPasswordLink });

  const mailOptions = {
    from: `Vendoro <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Resetowanie hasła',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

const sendGoogleWelcomeEmail = async (userEmail) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/googleWelcomeEmailTemplate.ejs')
  );

  const mailOptions = {
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Witamy w Vendoro!',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderConfirmationToCustomer = async (userEmail, orderDetails) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/orderCustomerEmailTemplate.ejs'),
    { order: orderDetails }
  );

  const mailOptions = {
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: `Zamówienie ${orderDetails.orderNumber}`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderNotificationToSeller = async (sellerEmail, orderDetails) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/orderSellerEmailTemplate.ejs'),
    { order: orderDetails }
  );

  const mailOptions = {
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `Nowe zamówienie produktu "${orderDetails.product.name}"`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendGoogleWelcomeEmail, sendOrderConfirmationToCustomer, sendOrderNotificationToSeller };