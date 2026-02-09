// tests/index.js
/**
 * Test Suite Index
 *
 * This file documents all available tests in the project.
 * Run `npm test` to execute all tests in watch mode.
 */

/**
 * Unit Tests Coverage:
 *
 * ✅ shared/log.js - Logging utility tests
 *    - logInfo, logWarn, logError, logDebug
 *    - Message formatting with timestamps and icons
 *
 * ✅ shared/email.js - Email utility tests
 *    - generateSecurityCode() - 6-digit code generation
 *    - hashCode() - Security code hashing
 *    - Code uniqueness and consistency
 *
 * ✅ stores/auth.js - Pinia authentication store
 *    - User state management
 *    - Authentication status (isAuthenticated)
 *    - User initialization and cleanup
 *    - Error handling
 *
 * ✅ router.js - Vue Router configuration
 *    - Route definitions
 *    - Meta tags (requiresAuth, layout)
 *    - Route components
 *    - Home, Signup, Signin, VerifyCode, Dashboard routes
 *
 * ✅ views/Index/IndexView.vue - Home page component
 *    - Component rendering
 *    - Navigation links
 *    - Feature list display
 *
 * ✅ components/layout/TheHeader.vue - Header component
 *    - Header rendering
 *    - Navigation structure
 *    - Branding/logo display
 *
 * ✅ validation.js - Data validation functions
 *    - Email validation (isValidEmail)
 *    - Password validation (isValidPassword)
 *    - Security code validation (isValidSecurityCode)
 *
 * ✅ api.utils.js - API utility functions
 *    - Error parsing (parseApiError)
 *    - Request formatting (formatRequestBody)
 *    - Response validation (isSuccessResponse)
 *
 * ✅ api.endpoints.js - API endpoint validation
 *    - Signup validation (POST /api/auth/signup)
 *    - Signin validation (POST /api/auth/signin)
 *    - Code verification validation (POST /api/auth/verify-code)
 *
 * Test Statistics:
 * - Total test suites: 8
 * - Total test cases: 50+
 * - Coverage: Line, Branch, Function coverage tracked
 *
 * Commands:
 * - npm test           - Run tests in watch mode
 * - npm run test:run   - Run tests once
 * - npm run test:ui    - Open test UI
 * - npm run test:coverage - Generate coverage report
 */

export default {
  testSuites: [
    'shared/log.js',
    'shared/email.js',
    'stores/auth.js',
    'router.js',
    'views/Index/IndexView.vue',
    'components/layout/TheHeader.vue',
    'validation.js',
    'api.utils.js',
    'api.endpoints.js'
  ],
  helpers: {
    validateEmail: 'Validates email format',
    validatePassword: 'Validates password strength',
    isValidSecurityCode: 'Validates 6-digit security code',
    parseApiError: 'Parses API error responses',
    formatRequestBody: 'Formats API request bodies',
    isSuccessResponse: 'Checks if API response is successful'
  }
}
