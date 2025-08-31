import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSSequelize from '@adminjs/sequelize'
import db from './src/models/index.js'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { ComponentLoader } from 'adminjs'
import { Op } from 'sequelize'
import dayjs from 'dayjs'

const require = createRequire(import.meta.url)
const config = require('./config/config.json')
const emailService = require('./src/services/emailService')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

AdminJS.registerAdapter(AdminJSSequelize)

const componentLoader = new ComponentLoader()
const COMPONENTS = {
  Dashboard: componentLoader.add('Dashboard', path.join(__dirname, 'admin', 'dashboard-component.jsx')),
  Login: componentLoader.override('Login', path.join(__dirname, 'admin', 'custom-login.jsx')),
}

const STATUS_LABELS = {
  new: 'Przyjęte',
  in_review: 'W trakcie weryfikacji',
  resolved: 'Zakończone pozytywnie',
  rejected: 'Odrzucone',
}
const ENTITY_LABELS = {
  rating: 'opinia',
  product: 'ogłoszenie',
  user: 'użytkownik',
}
const REASON_LABELS = {
  abuse: 'Nadużycie / obraźliwe treści',
  spam: 'Spam / reklama',
  hate: 'Mowa nienawiści',
  nsfw: 'Treści nieodpowiednie (NSFW)',
  fraud: 'Oszustwo / próba wyłudzenia',
  other: 'Inny powód',
}

async function buildEntityDisplay(record) {
  const type = record.params?.entityType
  const id = record.params?.entityId
  if (!type || !id) return '-'

  if (type === 'product') {
    const product = await db.Product.findByPk(id, { attributes: ['name'] })
    return product?.name ? `Ogłoszenie: ${product.name}` : `Ogłoszenie #${id}`
  }

  if (type === 'user') {
    const user = await db.User.findByPk(id, { attributes: ['firstName', 'lastName', 'email'] })
    if (!user) return `Użytkownik #${id}`
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    return name ? `Użytkownik: ${name}` : `Użytkownik ${user.email || `#${id}`}`
  }

  if (type === 'rating') {
    const rating = await db.Rating.findByPk(id, {
      attributes: ['id', 'comment'],
      include: [{ model: db.User, as: 'raterUser', attributes: ['firstName', 'lastName'] }],
    })
    if (!rating) return `Opinia #${id}`
    const author = rating.raterUser
      ? [rating.raterUser.firstName, rating.raterUser.lastName].filter(Boolean).join(' ')
      : ''
    const comment =
      rating.comment ? ` – „${String(rating.comment).slice(0, 40)}${rating.comment.length > 40 ? '…' : ''}”` : ''
    return `Opinia${author ? ` od ${author}` : ''}${comment}`
  }

  return `#${id}`
}

async function decorateReportRecord(record) {
  if (!record) return
  const p = record.params || {}
  record.params.statusLabel = STATUS_LABELS[p.status] || p.status || '-'
  record.params.entityLabel = ENTITY_LABELS[p.entityType] || p.entityType || '-'
  record.params.reasonLabel = REASON_LABELS[p.reason] || p.reason || '-'
  record.params.entityDisplay = await buildEntityDisplay(record)
}

const adminJs = new AdminJS({
  databases: [db.sequelize],
  rootPath: '/admin',
  componentLoader,
  loginPage: { component: COMPONENTS.Login },
  dashboard: {
    handler: async (request) => {
      const days = parseInt(request.query?.days) || 7

      const usersCount = await db.User.count()
      const productsCount = await db.Product.count()
      const ordersCount = await db.Order.count()

      const sales = await db.Order.findAll({
        attributes: ['createdAt'],
        where: { createdAt: { [Op.gte]: dayjs().subtract(days, 'day').startOf('day').toDate() } },
      })

      const lastSoldProducts = await db.Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: db.Product, as: 'product', attributes: ['id', 'name', 'price'] }],
        attributes: ['id', 'createdAt'],
      })

      const salesByCategory = await db.Order.findAll({
        include: [{
          model: db.Product, as: 'product',
          include: [{ model: db.Category, as: 'category', attributes: ['id', 'name'] }],
        }],
        where: { createdAt: { [Op.gte]: dayjs().subtract(days, 'day').startOf('day').toDate() } },
        attributes: ['id'],
      })

      const categorySalesMap = {}
      salesByCategory.forEach(order => {
        if (order.product?.category) {
          const c = order.product.category
          categorySalesMap[c.id] = categorySalesMap[c.id] || { id: c.id, name: c.name, count: 0 }
          categorySalesMap[c.id].count++
        }
      })
      const salesByCategoryData = Object.values(categorySalesMap).sort((a, b) => b.count - a.count)

      let salesChartData = []
      if (days <= 30) {
        const lastDays = Array.from({ length: days }).map((_, i) => {
          const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD')
          return { date, count: 0 }
        })
        for (const sale of sales) {
          const date = dayjs(sale.createdAt).format('YYYY-MM-DD')
          const match = lastDays.find(d => d.date === date)
          if (match) match.count++
        }
        salesChartData = lastDays
      } else {
        const monthsCount = days === 365 ? 12 : Math.ceil(days / 30)
        const startMonth = dayjs().subtract(monthsCount - 1, 'month').startOf('month')
        const months = Array.from({ length: monthsCount }).map((_, i) => {
          const m = startMonth.add(i, 'month')
          return { month: m.format('YYYY-MM'), label: m.format('MMMM'), count: 0 }
        })
        for (const sale of sales) {
          const saleMonth = dayjs(sale.createdAt).format('YYYY-MM')
          const match = months.find(m => m.month === saleMonth)
          if (match) match.count++
        }
        salesChartData = months.map(m => ({ date: m.label, count: m.count }))
      }

      return {
        usersCount,
        productsCount,
        ordersCount,
        salesChartData,
        lastSoldProducts: lastSoldProducts.map(o => ({
          id: o.id,
          productId: o.product.id,
          productName: o.product.name,
          price: o.product.price,
          date: dayjs(o.createdAt).format('YYYY-MM-DD HH:mm'),
        })),
        salesByCategory: salesByCategoryData,
      }
    },
    component: COMPONENTS.Dashboard,
  },
  branding: {
    companyName: 'Vendoro Control Panel',
    logo: false,
    softwareBrothers: false,
    theme: {
      colors: {
        primary100: '#FE8D1C',
        primary80: '#FE8D1C',
        primary60: '#FE8D1C',
        grey100: '#242424',
        grey80: '#242424',
        grey20: '#F2F2F2',
        filterBg: '#F2F2F2',
        hoverBg: '#FE8D1C33',
        accent: '#FE8D1C',
      },
    },
  },
  resources: [
    {
      resource: db.User,
      options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'email', 'firstName', 'lastName', 'phone', 'isVerified'],
        properties: {
          avatar: { isVisible: false },
          password: { isVisible: false },
          passwordChangedAt: { isDisabled: true },
        },
      },
    },
    { resource: db.Address, options: { navigation: { name: 'Resources' }, listProperties: ['id', 'userId', 'city', 'street', 'houseNumber', 'postalCode'] } },
    { resource: db.Rating, options: { navigation: { name: 'Resources' }, listProperties: ['id', 'rating', 'comment', 'raterUserId', 'ratedUserId'] } },
    { resource: db.Session, options: { navigation: { name: 'Resources' } } },
    { resource: db.Category, options: { navigation: { name: 'Resources' }, listProperties: ['id', 'name', 'description', 'icon'] } },
    {
      resource: db.Product,
      options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'name', 'location', 'price', 'condition'],
        properties: {
          photo1: { isVisible: false },
          photo2: { isVisible: false },
          photo3: { isVisible: false },
          photo4: { isVisible: false },
          photo5: { isVisible: false },
        },
      },
    },
    { resource: db.ProductLike, options: { navigation: { name: 'Resources' }, listProperties: ['id', 'userId', 'productId'] } },
    { resource: db.Order, options: { navigation: { name: 'Resources' }, listProperties: ['id', 'orderNumber', 'userId', 'productId', 'wantInvoice', 'status', 'totalPrice'] } },
    {
      resource: db.Payment,
      options: {
        navigation: { name: 'Resources' },
        listProperties: ['id', 'orderNumber', 'method', 'status', 'amount'],
        properties: {
          orderId: { isVisible: false },
          orderNumber: { isVisible: { list: true, filter: true, show: true, edit: false }, isVirtual: true },
        },
        actions: {
          list: { after: async (response) => { await Promise.all(response.records.map(attachOrderNumber)); return response } },
          show: { after: async (response) => { await attachOrderNumber(response.record); return response } },
        },
      },
    },

    {
      resource: db.Report,
      options: {
        navigation: { name: 'Moderation' },
        listProperties: ['id', 'entityLabel', 'entityDisplay', 'reasonLabel', 'statusLabel', 'createdAt'],
        filterProperties: ['entityType', 'reason', 'status', 'reporterUserId', 'createdAt'],
        showProperties: ['entityLabel', 'entityDisplay', 'reasonLabel', 'details', 'statusLabel', 'reporterUserId', 'createdAt', 'updatedAt'],
        editProperties: ['status'],
        properties: {
          entityLabel: { isVisible: { list: true, show: true, edit: false, filter: false }, isVirtual: true },
          reasonLabel: { isVisible: { list: true, show: true, edit: false, filter: false }, isVirtual: true },
          statusLabel: { isVisible: { list: true, show: true, edit: false, filter: false }, isVirtual: true },
          entityDisplay: { isVisible: { list: true, show: true, edit: false, filter: false }, isVirtual: true },

          reporterUserId: { isDisabled: true },
          entityType: {
            isDisabled: true,
            availableValues: [
              { value: 'rating', label: ENTITY_LABELS.rating },
              { value: 'product', label: ENTITY_LABELS.product },
              { value: 'user', label: ENTITY_LABELS.user },
            ],
          },
          entityId: { isDisabled: true },
          reason: {
            isDisabled: true,
            availableValues: Object.entries(REASON_LABELS).map(([value, label]) => ({ value, label })),
          },
          details: { type: 'richtext', isDisabled: true },
          status: { availableValues: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })) },
        },
        actions: {
          list: { after: async (response) => { await Promise.all(response.records.map(decorateReportRecord)); return response } },
          show: { after: async (response) => { await decorateReportRecord(response.record); return response } },
          edit: {
            before: async (request) => {
              if (request.payload) {
                request.payload = { status: request.payload.status }
              }
              return request
            },
            after: async (response) => {
              try {
                const reportId = response?.record?.params?.id
                if (reportId) {
                  const report = await db.Report.findByPk(reportId)
                  if (report) {
                    const reporter = await db.User.findByPk(report.reporterUserId, { attributes: ['email'] })
                    const plain = report.get({ plain: true })
                    const entityDisplay = await buildEntityDisplay({ params: plain })

                    if (reporter?.email) {
                      await emailService.sendReportStatusUpdate(reporter.email, {
                        report: plain,      
                        entityDisplay,     
                      })
                    }
                  }
                }
              } catch (e) {
                console.warn('sendReportStatusUpdate failed:', e?.message || e)
              }

              await decorateReportRecord(response.record)
              return response
            },
          },
          new: { isAccessible: false },
          delete: { isAccessible: true },
        },
      },
    },
  ],
})

const authenticate = async (email, password) => {
  const user = await db.User.findOne({
    where: { email },
    attributes: ['id', 'email', 'password', 'role', 'firstName', 'lastName'],
  })
  if (!user) throw new Error('User not found')
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) throw new Error('Invalid password')
  if (user.role !== 'admin') throw new Error('User is not an admin')
  return { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role }
}

const env = process.env.NODE_ENV || 'development'
const adminConfig = config[env].ADMINJS

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  { authenticate, cookieName: 'adminjs', cookiePassword: adminConfig.COOKIE_SECRET },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: adminConfig.SESSION_SECRET,
    cookie: { httpOnly: adminConfig.COOKIE_HTTPONLY, secure: adminConfig.COOKIE_SECURE, maxAge: 1000 * 60 * 60 * 24 },
    name: 'adminjs',
  }
)

const attachOrderNumber = async (record) => {
  const orderId = record.params.orderId
  if (orderId) {
    const order = await db.Order.findByPk(orderId, { attributes: ['orderNumber'] })
    record.params.orderNumber = order ? order.orderNumber : null
  }
}

export { adminJs, adminRouter }