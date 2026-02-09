# Vue 3 SSR Starter Kit

A comprehensive Vue 3 Server-Side Rendering (SSR) starter kit with authentication, i18n, Vuetify, MongoDB, and email capabilities.

## Features

- **Vue 3** - Latest Vue features with Composition API
- **Server-Side Rendering (SSR)** - SEO-friendly with optimal performance
- **Vite** - Fast build tool and dev server
- **Vuetify 3** - Material Design components
- **Vue Router 4** - Client-side routing
- **Pinia** - State management
- **Vue i18n** - Internationalization (EN, FR)
- **MongoDB** - NoSQL database
- **Authentication** - Email/password signup, signin with security code verification
- **Email** - Support for sending emails via Nodemailer
- **SCSS** - Advanced styling with variables and mixins
- **Express.js** - Server framework
- **Session Management** - File-based session storage
- **Testing** - Vitest with 50+ unit tests and comprehensive test suites
- **Linting** - ESLint + Prettier for code quality and consistency

## Project Structure

```
src/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   └── router.js          # API routes registry
├── components/            # Vue components
│   └── layout/            # Layout components (Header, Footer)
├── stores/                # Pinia stores
│   └── auth.js            # Authentication store
├── views/                 # Page components
│   ├── Index/
│   ├── Auth/              # Signup, Signin, VerifyCode
│   ├── Dashboard/
│   └── NotFound/
├── plugins/               # Vue plugins
│   └── vuetify.js         # Vuetify configuration
├── shared/                # Shared utilities
│   ├── log.js             # Logger
│   ├── mongo.js           # MongoDB connection
│   └── email.js           # Email utilities
├── styles/                # Global styles
│   ├── variables.scss
│   └── mixins.scss
├── translate/             # i18n translations
│   ├── en.json
│   ├── fr.json
│   └── emails/            # Email templates
├── App.vue                # Root component
├── main.js                # App initialization
├── router.js              # Vue Router configuration
├── entry-client.js        # Client entry point
└── entry-server.js        # Server entry point
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `env_sample` to `.env` and update with your values:

```bash
cp env_sample .env
```

### 3. MongoDB Setup

Make sure MongoDB is running and accessible at the configured host.

### 4. Email Configuration

Configure your mail service credentials in `.env` (MAILER_* variables).

## Development

### Start dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI/CD)
npm run test:run

# View interactive test interface
npm run test:ui

# Generate coverage report
npm run test:coverage
```

See [TESTING.md](./TESTING.md) for more details on writing and running tests.

### Code Quality & Linting

```bash
# Check linting issues
npm run lint:check

# Fix linting issues automatically
npm run lint
```

The project uses ESLint + Prettier for code quality with Vue 3 best practices.

## Building

### Build for production

```bash
npm run build
```

This creates:
- `dist/client/` - Client bundle
- `dist/server/` - Server bundle

### Run production build

```bash
npm run prod
```

## Translation

All user-facing text is localized in JSON files under `src/translate/`. The app supports English (en) and French (fr).

### Adding new translations

1. Add the key-value pair to both `en.json` and `fr.json`
2. Use in components: `{{ t('key.name') }}`

## Authentication Flow

1. User signs up/in with email and password
2. Security code is sent via email
3. User verifies code
4. Session is created and user can access protected routes

## Database Collections

### users

```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  createdAt: Date,
  updatedAt: Date,
  securityCode: string (hashed),
  securityCodeExpires: Date,
  securityCodeAttempts: number
}
```

## Customization

### Change Theme Colors

Edit `src/plugins/vuetify.js` to customize Vuetify theme colors.

### Add New Routes

1. Create a new component in `src/views/`
2. Add route to `src/router.js`
3. Add i18n entries to translation files

### Add New API Endpoints

1. Create endpoint file in `src/api/`
2. Export a setup function following the pattern
3. Register in `src/api/router.js`

## Production Checklist

- [ ] Update `COOKIE_SECRET` to a strong random value
- [ ] Configure production database connection
- [ ] Set up email service with production credentials
- [ ] Update `NODE_HOST` for prod domain
- [ ] Enable secure cookies (set `secure: true` when using HTTPS)
- [ ] Add error logging/monitoring
- [ ] Configure backup strategy for MongoDB
- [ ] Review and update security policies
- [ ] Run all tests: `npm run test:run`
- [ ] Check code quality: `npm run lint:check`
- [ ] Generate coverage report: `npm run test:coverage`

## Additional Resources

- **[Testing Guide](./TESTING.md)** - Comprehensive testing setup and examples
- **[Contributing Guide](./CONTRIBUTING.md)** - Code standards and contribution process
- **[Security Checklist](./SECURITY_CHECKLIST.md)** - Security best practices
- **[Complete Documentation](./DOCUMENTATION.md)** - Full architecture and API reference

## License

MIT
