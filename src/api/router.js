import { setupMeRoute } from './auth/me.js'
import { setupSignupRoute } from './auth/signup.js'
import { setupSigninRoute } from './auth/signin.js'
import { setupSignoutRoute } from './auth/signout.js'
import { setupVerifyCodeRoute } from './auth/verifyCode.js'
import { setupResendCodeRoute } from './auth/resendCode.js'

export function registerApiRoutes(app, db) {
  setupMeRoute(app, db)
  setupSignupRoute(app, db)
  setupSigninRoute(app, db)
  setupSignoutRoute(app, db)
  setupVerifyCodeRoute(app, db)
  setupResendCodeRoute(app, db)
}
