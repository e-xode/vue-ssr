import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { setMiddlewareDb } from './middleware.js';
import { setupMeRoute } from './auth/me.js';
import { setupSignupRoute } from './auth/signup.js';
import { setupSigninRoute } from './auth/signin.js';
import { setupSignoutRoute } from './auth/signout.js';
import { setupVerifyCodeRoute } from './auth/verifyCode.js';
import { setupResendCodeRoute } from './auth/resendCode.js';
import { setupChangePasswordRoute } from './auth/changePassword.js';
import { setupChangeEmailRoute } from './auth/changeEmail.js';
import { setupForgotPasswordRoute } from './auth/forgotPassword.js';
import { setupResetPasswordRoute } from './auth/resetPassword.js';
import { setupUpdateProfileRoute } from './auth/updateProfile.js';
import { setupAvatarRoute } from './auth/avatar.js';
import { setupAdminUsersRoutes } from './admin/users.js';
import { setupAdminLogsRoute } from './admin/logs.js';
import { setupContactRoute } from './contact/send.js';

const isProduction = process.env.NODE_ENV === 'production';

const createLimiter = (max) =>
  isProduction
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'error.rateLimit' },
      })
    : (req, res, next) => next();

const signupLimiter = createLimiter(5);
const authLimiter = createLimiter(10);
const accountLimiter = createLimiter(20);
const contactLimiter = createLimiter(3);

export function createApiRouter(db) {
  setMiddlewareDb(db);

  const router = express.Router();

  router.use('/api/auth/signup', signupLimiter);
  router.use('/api/auth/signin', authLimiter);
  router.use('/api/auth/verify-code', authLimiter);
  router.use('/api/auth/resend-code', authLimiter);
  router.use('/api/auth/forgot-password', authLimiter);
  router.use('/api/auth/reset-password', authLimiter);
  router.use('/api/auth/change-email', accountLimiter);
  router.use('/api/auth/verify-email-change', accountLimiter);
  router.use('/api/auth/change-password', accountLimiter);
  router.use('/api/contact', contactLimiter);

  setupMeRoute(router, db);
  setupSignupRoute(router, db);
  setupSigninRoute(router, db);
  setupSignoutRoute(router, db);
  setupVerifyCodeRoute(router, db);
  setupResendCodeRoute(router, db);
  setupChangePasswordRoute(router, db);
  setupChangeEmailRoute(router, db);
  setupForgotPasswordRoute(router, db);
  setupResetPasswordRoute(router, db);
  setupUpdateProfileRoute(router, db);
  setupAvatarRoute(router, db);

  setupAdminUsersRoutes(router, db);
  setupAdminLogsRoute(router, db);
  setupContactRoute(router, db);

  return router;
}
