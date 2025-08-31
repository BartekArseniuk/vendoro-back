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

const statusMap = {
  new: 'Przyjęte',
  in_review: 'W trakcie weryfikacji',
  resolved: 'Zakończone pozytywnie',
  rejected: 'Odrzucone',
};
const entityMap = {
  rating: 'Opinia',
  product: 'Ogłoszenie',
  user: 'Użytkownik',
};
const reasonMap = {
  abuse: 'Nadużycie',
  spam: 'Spam',
  hate: 'Mowa nienawiści',
  nsfw: 'Treści nieodpowiednie',
  fraud: 'Oszustwo',
  other: 'Inny powód',
};

function fallbackEntityDisplay(report) {
  const base = entityMap[report.entityType] || report.entityType;
  return `${base}`;
}

const sendVerificationEmail = async (userEmail, token) => {
  const verificationLink = `${config.development.BASE_URL}/api/users/verify/${token}`;
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/verificationEmailTemplate.ejs'),
    { verificationLink }
  );
  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Potwierdź swoje konto',
    html: htmlContent,
  });
};

const sendResetPasswordEmail = async (userEmail, token) => {
  const resetPasswordLink = `${config.development.BASE_URL}/api/users/reset-password/${token}`;
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/resetPasswordEmailTemplate.ejs'),
    { resetPasswordLink }
  );
  await transporter.sendMail({
    from: `Vendoro <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Resetowanie hasła',
    html: htmlContent,
  });
};

const sendGoogleWelcomeEmail = async (userEmail) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/googleWelcomeEmailTemplate.ejs')
  );
  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Witamy w Vendoro!',
    html: htmlContent,
  });
};

const sendOrderConfirmationToCustomer = async (userEmail, orderDetails) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/orderCustomerEmailTemplate.ejs'),
    { order: orderDetails }
  );
  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: `Zamówienie ${orderDetails.orderNumber}`,
    html: htmlContent,
  });
};

const sendOrderNotificationToSeller = async (sellerEmail, orderDetails) => {
  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/orderSellerEmailTemplate.ejs'),
    { order: orderDetails }
  );
  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `Nowe zamówienie produktu "${orderDetails.product.name}"`,
    html: htmlContent,
  });
};

const sendReportReceived = async (userEmail, { report, entityDisplay }) => {
  const viewModel = {
    report,
    statusLabel: statusMap[report.status] || report.status,
    entityLabel: entityMap[report.entityType] || report.entityType,
    reasonLabel: reasonMap[report.reason] || report.reason,
    entityDisplay: entityDisplay || fallbackEntityDisplay(report),
  };

  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/reportReceivedEmailTemplate.ejs'),
    viewModel
  );

  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: `Zgłoszenie przyjęte`,
    html: htmlContent,
  });
};

const sendReportStatusUpdate = async (userEmail, { report, entityDisplay }) => {
  const viewModel = {
    report,
    statusLabel: statusMap[report.status] || report.status,
    entityLabel: entityMap[report.entityType] || report.entityType,
    reasonLabel: reasonMap[report.reason] || report.reason,
    entityDisplay: entityDisplay || fallbackEntityDisplay(report),
  };

  const htmlContent = await ejs.renderFile(
    path.join(__dirname, '../views/reportStatusUpdateEmailTemplate.ejs'),
    viewModel
  );

  await transporter.sendMail({
    from: `"Vendoro" <${config.development.EMAIL_USER}>`,
    to: userEmail,
    subject: `Status zgłoszenia: ${viewModel.statusLabel}`,
    html: htmlContent,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendGoogleWelcomeEmail,
  sendOrderConfirmationToCustomer,
  sendOrderNotificationToSeller,
  sendReportReceived,
  sendReportStatusUpdate,
};