const { Report, User, Rating, Product } = require('../models');
const { sendReportReceived } = require('../services/emailService');

const ALLOWED_TYPES = ['rating', 'product', 'user'];
const ALLOWED_REASONS = ['abuse', 'spam', 'hate', 'nsfw', 'fraud', 'other'];

async function buildEntityDisplay(entityType, entityId) {
  if (entityType === 'rating') {
    const r = await Rating.findByPk(entityId, {
      attributes: ['comment', 'rating'],
      include: [{ model: User, as: 'raterUser', attributes: ['firstName', 'lastName'] }],
    });
    if (!r) return null;
    const author = r.raterUser ? `${r.raterUser.firstName || ''} ${r.raterUser.lastName || ''}`.trim() : 'Użytkownik';
    const comment = r.comment ? `"${String(r.comment).slice(0, 120)}${r.comment.length > 120 ? '…' : ''}"` : '(bez treści)';
    return `Opinia ${author}, ${r.rating}/5 – ${comment}`;
  }

  if (entityType === 'product') {
    const p = await Product.findByPk(entityId, { attributes: ['name', 'price'] });
    if (!p) return null;
    const price = typeof p.price === 'number' ? ` — ${p.price.toFixed(2)} zł` : '';
    return `Ogłoszenie „${p.name}”${price}`;
  }

  if (entityType === 'user') {
    const u = await User.findByPk(entityId, { attributes: ['firstName', 'lastName', 'email'] });
    if (!u) return null;
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return name ? `Użytkownik ${name}` : `użytkownik ${u.email}`;
  }

  return null;
}

exports.createReport = async (req, res) => {
  try {
    const reporterUserId = req.user?.id;
    if (!reporterUserId) {
      return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
    }

    const { entityType, entityId, reason, details } = req.body || {};

    if (!ALLOWED_TYPES.includes(entityType)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy typ zgłoszenia' });
    }
    if (!Number.isInteger(entityId)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowe ID obiektu' });
    }
    if (!ALLOWED_REASONS.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Nieprawidłowy powód zgłoszenia' });
    }

    if (entityType === 'rating') {
      const exists = await Rating.findByPk(entityId, { attributes: ['id'] });
      if (!exists) return res.status(404).json({ success: false, message: 'Ocena nie istnieje' });
    } else if (entityType === 'product') {
      const exists = await Product.findByPk(entityId, { attributes: ['id'] });
      if (!exists) return res.status(404).json({ success: false, message: 'Produkt nie istnieje' });
    } else if (entityType === 'user') {
      const exists = await User.findByPk(entityId, { attributes: ['id'] });
      if (!exists) return res.status(404).json({ success: false, message: 'Użytkownik nie istnieje' });
    }

    const entityDisplay = await buildEntityDisplay(entityType, entityId);

    const report = await Report.create({
      reporterUserId,
      entityType,
      entityId,
      reason,
      details: details?.slice(0, 2000) || null,
      status: 'new',
    });

    const reporter = await User.findByPk(reporterUserId, { attributes: ['email'] });
    if (reporter?.email) {
      try {
        await sendReportReceived(reporter.email, { report: report.toJSON(), entityDisplay });
      } catch (e) {
        console.warn('sendReportReceived failed:', e?.message || e);
      }
    }

    return res.status(201).json({
      success: true,
      report: {
        id: report.id,
        status: report.status,
        entityType: report.entityType,
        entityId: report.entityId,
        reason: report.reason,
        details: report.details,
        createdAt: report.createdAt,
      },
      message: 'Zgłoszenie przyjęte. Dziękujemy!',
    });
  } catch (err) {
    console.error('createReport error:', err);
    return res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
};