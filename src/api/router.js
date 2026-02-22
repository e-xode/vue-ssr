import { rateLimit } from 'express-rate-limit'
import { setupMeRoute } from './auth/me.js'
import { setupSignupRoute } from './auth/signup.js'
import { setupSigninRoute } from './auth/signin.js'
import { setupSignoutRoute } from './auth/signout.js'
import { setupVerifyCodeRoute } from './auth/verifyCode.js'
import { setupResendCodeRoute } from './auth/resendCode.js'
import { setupAdminUsersRoutes } from './admin/users.js'

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

export function registerApiRoutes(app, db) {
  app.use('/api/auth/signup', authLimiter)
  app.use('/api/auth/signin', authLimiter)
  app.use('/api/auth/verify-code', authLimiter)
  app.use('/api/auth/resend-code', authLimiter)

  setupMeRoute(app, db)
  setupSignupRoute(app, db)
  setupSigninRoute(app, db)
  setupSignoutRoute(app, db)
  setupVerifyCodeRoute(app, db)
  setupResendCodeRoute(app, db)

  setupAdminUsersRoutes(app, db)
}
