import { rateLimit } from 'express-rate-limit'
import { setupMeRoute } from './auth/me.js'
import { setupSignupRoute } from './auth/signup.js'
import { setupSigninRoute } from './auth/signin.js'
import { setupSignoutRoute } from './auth/signout.js'
import { setupVerifyCodeRoute } from './auth/verifyCode.js'
import { setupResendCodeRoute } from './auth/resendCode.js'
import { setupChangePasswordRoute } from './auth/changePassword.js'
import { setupChangeEmailRoute } from './auth/changeEmail.js'
import { setupForgotPasswordRoute } from './auth/forgotPassword.js'
import { setupResetPasswordRoute } from './auth/resetPassword.js'
import { setupUpdateProfileRoute } from './auth/updateProfile.js'
import { setupAdminUsersRoutes } from './admin/users.js'
import { setupAdminLogsRoute } from './admin/logs.js'

function createLimiter(max, windowMinutes = 15) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: 'error.tooManyRequests' })
    }
  })
}

const authLimiter = createLimiter(10)
const accountLimiter = createLimiter(20)

export function registerApiRoutes(app, db) {
  app.use('/api/auth/signup', authLimiter)
  app.use('/api/auth/signin', authLimiter)
  app.use('/api/auth/verify-code', authLimiter)
  app.use('/api/auth/resend-code', authLimiter)
  app.use('/api/auth/forgot-password', authLimiter)
  app.use('/api/auth/reset-password', authLimiter)
  app.use('/api/auth/change-email', accountLimiter)
  app.use('/api/auth/verify-email-change', accountLimiter)
  app.use('/api/auth/change-password', accountLimiter)

  setupMeRoute(app, db)
  setupSignupRoute(app, db)
  setupSigninRoute(app, db)
  setupSignoutRoute(app, db)
  setupVerifyCodeRoute(app, db)
  setupResendCodeRoute(app, db)
  setupChangePasswordRoute(app, db)
  setupChangeEmailRoute(app, db)
  setupForgotPasswordRoute(app, db)
  setupResetPasswordRoute(app, db)
  setupUpdateProfileRoute(app, db)

  setupAdminUsersRoutes(app, db)
  setupAdminLogsRoute(app, db)
}
