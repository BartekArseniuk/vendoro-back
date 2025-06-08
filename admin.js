import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import AdminJSSequelize from '@adminjs/sequelize'
import db from './src/models/index.js'
import bcrypt from 'bcrypt'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require('./config/config.json')

AdminJS.registerAdapter(AdminJSSequelize)

const adminJs = new AdminJS({
  databases: [db.sequelize],
  rootPath: '/admin',
  branding: {
    companyName: 'Vendoro Control Panel',
    logo: false,
    softwareBrothers: false,
  },
})

const authenticate = async (email, password) => {
  try {
    const user = await db.User.findOne({
      where: { email },
      attributes: ['id', 'email', 'password', 'role', 'firstName', 'lastName']
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    if (user.role !== 'admin') {
      throw new Error('User is not an admin')
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role
    }
  } catch (error) {
    throw error
  }
}

const env = process.env.NODE_ENV || 'development'
const adminConfig = config[env].ADMINJS

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: adminConfig.COOKIE_SECRET,
  },
  null,
  {
    resave: true,
    saveUninitialized: true,
    secret: adminConfig.SESSION_SECRET,
    cookie: {
      httpOnly: adminConfig.COOKIE_HTTPONLY,
      secure: adminConfig.COOKIE_SECURE,
      maxAge: 1000 * 60 * 60 * 24,
    },
    name: 'adminjs',
  }
)

export { adminJs, adminRouter }