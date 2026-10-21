# Architecture Détaillée

## Vue d'ensemble

Ce document décrit l'architecture complète du projet e-xode-vue-ssr, ses composants, et comment ils interagissent.

## Architecture Multi-Couches

```
┌─────────────────────────────────────────────────────────────────┐
│                        COUCHE PRÉSENTATION                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vue 3 Components (SFC)                                 │  │
│  │  - Pages (views/)                                       │  │
│  │  - Composants (components/)                             │  │
│  │  - Layouts                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  État (Pinia Stores)                                    │  │
│  │  - authStore                                            │  │
│  │  - Réactivité centralisée                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                        COUCHE MÉTIER (API)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express Server (Node.js)                               │  │
│  │  - Routeur API (/api/auth, /api/...)                    │  │
│  │  - Middleware (Session, CORS, Auth)                     │  │
│  │  - SSR Rendering                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Logique Métier                                         │  │
│  │  - Auth business logic                                  │  │
│  │  - Validation                                           │  │
│  │  - Emailing                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB                                                │  │
│  │  - Collections (users, etc.)                            │  │
│  │  - Indexes, validations                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services Externes                                      │  │
│  │  - SMTP pour emails                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Couche Présentation

### Vue 3 + Vite

```
src/
├── App.vue                    # Composant racine
├── main.js                    # createApp({ theme, locale, initialState }) -> app, router, pinia, i18n, vuetify, setLocale
├── entry-client.js            # Client hydration (restores Pinia state from #__SSR_STATE__)
├── entry-server.js            # SSR render(url, db, theme): route prefetch, renderToString
├── ssr/head.js                # <head> generation (meta, canonical, hreflang, OG, JSON-LD)
├── router.js                  # Configuration des routes
├── directives/reveal.js       # v-reveal scroll animation
├── views/                     # Pages
│   ├── Index/
│   ├── Auth/
│   ├── Dashboard/
│   └── NotFound/
├── components/                # Composants réutilisables
│   └── layout/
│       ├── TheHeader.vue
│       └── TheFooter.vue
└── stores/                    # Pinia state management
    └── auth.js
```

### Flux de Rendu

```
Client Browser
    ↓
entry-client.js
    ↓
createApp({ initialState: readSsrState() })
    ↓
Pinia state restored from <script type="application/json" id="__SSR_STATE__">
    ↓
Hydrate DOM du serveur
    ↓
Vue app active + interactive
    → Event listeners attachés
    → Store reactivity
    → Router navigation
```

### Pinia Store Architecture

```
useAuthStore()
├── State:
│   ├── user: ref(null)
│   ├── loading: ref(false)
│   ├── error: ref(null)
│   └── pendingEmail: ref(null)
├── Computed:
│   └── isAuthenticated: computed()
└── Actions:
    ├── fetchUser()
    ├── signup()
    ├── signin()
    ├── verifyCode()
    └── signout()
```

## 2. Couche Routage

### Vue Router Configuration

```javascript
createRouter({
  history: createWebHistory() ou createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: IndexView,
      meta: {
        layout: 'public',
        title: 'meta.index.title',
        requiresAuth: false
      }
    },
    // ... autres routes
  ]
})
```

### Stratégie SSR

```
1. Requête serveur pour /ma-page
    ↓
2. redirectMiddleware: "/" -> 302 to /{locale}; non-canonical paths -> 301
    ↓
3. entry-server.js lance le router vers /ma-page
    ↓
4. Les guards et hooks s'exécutent
    ↓
5. route.meta.prefetch (optional) fills the Pinia stores
    ↓
6. Vue renderToString() génère l'HTML
    ↓
7. Meta tags SEO générés (src/ssr/head.js)
    ↓
8. HTML complet + <script type="application/json" id="__SSR_STATE__"> retournés au navigateur
    ↓
9. Client hydrate le DOM avec entry-client.js
```

## 3. Couche Métier (API)

### Express Server

```
server.js (thin wiring, one module per concern in src/api/http/)
    ↓
├── 1. Boot checks: COOKIE_SECRET and a public https NODE_HOST (production)
├── 2. MongoDB connection + ensureIndexes()
├── 3. helmet (CSP without inline scripts), GET /healthz, rate limits (production)
├── 4. /sitemap.xml + /robots.txt
├── 5. Session middleware, CORS, JSON parser
├── 6. API router (createApiRouter), via Vite in dev
├── 7. Production: /uploads, compression + sirv (dist/client)
├── 8. redirectMiddleware (302 for "/", 301 for canonical paths)
└── 9. SSR rendering middleware (src/api/http/ssr.js)
```

On SIGTERM/SIGINT the server flips `/healthz` to 503, closes the HTTP server, closes MongoDB, then exits (forced exit after 10 s).

### Architecture API Routes

```
src/api/
├── router.js                  # Registre central (createApiRouter)
├── middleware.js              # requireAuth / requireAdmin
├── emailDelivery.js           # deliverEmail(): 502 error.emailFailed on failure
├── http/                      # HTTP-host modules wired by server.js
└── auth/
    ├── me.js                  # GET  /api/auth/me
    ├── signup.js              # POST /api/auth/signup
    ├── signin.js              # POST /api/auth/signin
    ├── verify-code.js         # POST /api/auth/verify-code
    ├── resend-code.js         # POST /api/auth/resend-code
    └── signout.js             # POST /api/auth/signout
```

### Flux d'une requête API

```
HTTP Request: POST /api/auth/signup { email, password, name }
    ↓
Express Router matche /api/auth/signup
    ↓
setupSignupRoute(app, db) handler
    ↓
1. Validation input
2. Hash password (bcryptjs)
3. Générer code sécurité
4. Insérer user en DB
5. Envoyer email
    ↓
Response: { status: 'verification_pending', email }
    ↓
Client Pinia store reçoit
```

### Gestion des Sessions

```
1. Utilisateur se connecte + vérifie code
    ↓
2. startUserSession(): new session id, req.session.userId = user._id, req.session.createdAt = now
    ↓
3. Session stockée: logs/sessions/{sessionId}.json
    ↓
4. Cookie "app.sid" envoyé au client
    ↓
5. Client inclut cookie dans les requêtes futures
    ↓
6. Middleware session restaure req.session
    ↓
7. requireAuth rejects the session once it is older than SESSION_ABSOLUTE_MAX_AGE_MS (30 days)
    ↓
8. Password/email change: other sessions destroyed, session id regenerated.
   Password reset and admin block/delete: all sessions of the user destroyed
```

## 4. Couche Authentification

### Flux d'authentification complet

```
┌─────────────────────────────────────────────────────────────┐
│ SIGNUP / SIGNIN                                             │
└─────────────────────────────────────────────────────────────┘

User input: email, password
    ↓
Client: POST /api/auth/signup
    ↓
Server:
  1. Valider format email/password
  2. Vérifier si email existe déjà (signup)
  3. Hash password (bcryptjs, salt: 10)
  4. Générer code 6 chiffres
  5. Hash code en SHA-256 (hex)
  6. DB.users.insertOne() ou updateOne()
  7. sendSecurityCodeEmail(email, code)
    ↓
Response: { status: 'verification_pending', email }
    ↓
Client naviguer vers /auth/verify-code

┌─────────────────────────────────────────────────────────────┐
│ VERIFY CODE                                                 │
└─────────────────────────────────────────────────────────────┘

User input: code (6 chiffres)
    ↓
Client: POST /api/auth/verify-code { email, code }
    ↓
Server:
  1. Trouver user par email
  2. Valider code n'a pas expiré
  3. Valider tentatives < 3
  4. Comparer hashCode(input) avec DB hash
  5. Si valide:
     - Créer session (id régénéré): req.session.userId = user._id
     - Nettoyer codes de sécurité
     - Retourner profil user
    ↓
Response: { user: { _id, email, name, createdAt } }
    ↓
Client:
  1. Store user dans Pinia
  2. Naviguer vers /dashboard
  3. Cookie app.sid automatiquement envoyé
```

### Sécurité des Passwords

```
Password input: "MyPassword123!"
    ↓
bcryptjs.hash(password, saltRounds=10)
    ↓
Résultat: "$2a$10$N9qo8uLOickgx2ZMRZoHK.n3YK4N7S8kAL..."
    ↓
S toréd en DB
    ↓
À la connexion:
  bcryptjs.compare(input, hashedFromDB)
  → true ou false
```

### Sécurité des Codes

```
Code généré: "123456" (crypto.randomInt)
    ↓
SHA-256 hex digest
    ↓
Stocké: { _id, securityCode: "<sha256 hex>", securityCodeExpires: Date }
    ↓
Validation:
  1. Récupérer hash de DB
  2. timingSafeEqual(sha256(userInput), hashFromDB)
```

## 5. Couche Données MongoDB

### Collection Users

```javascript
db.users
├── Indexes:
│   └── { email: 1 } → unique
├── Schéma:
│   {
│     _id: ObjectId('...'),
│     email: 'user@example.com',          // Unique
│     password: '$2a$10$...',             // Hashed
│     name: 'John Doe',
│     createdAt: ISODate('2024-02-08'),
│     updatedAt: ISODate('2024-02-08'),
│     securityCode: '<sha256 hex>',       // Hashed
│     securityCodeExpires: ISODate('...'),
│     securityCodeAttempts: 2
│   }
├── Opérations:
│   ├── insertOne()         → signup
│   ├── findOne()           → signin, verify
│   ├── updateOne()         → update code, profile
│   └── deleteOne()         → delete account
```

Other indexes (`src/api/http/indexes.js`): `blockedIps` `{ ip: 1 }` unique; `logs` `{ createdAt: -1 }`, `{ event: 1 }`, `{ userId: 1 }`.

### Connexion MongoDB

```javascript
// src/shared/mongo.js
mongoConnect():
  1. Construire URL: mongodb://user:pwd@host/db
  2. MongoClient.connect()
  3. Tester connexion
  4. Retourner db instance
    ↓
Usage:
  const { db } = await mongoConnect()
  db.collection('users').findOne({ email })
```

## 6. Couche Emailing (Nodemailer)

### Configuration

```javascript
// src/shared/email.js
Transporter: host: process.env.MAILER_HOST;
port: process.env.MAILER_PORT;
ssl: process.env.MAILER_SSL === 'true';
auth: user: process.env.MAILER_LOGIN;
pass: process.env.MAILER_PASSWORD;
```

### Templates d'Email

```
src/translate/emails/
├── en.js
│   └── emailTemplates.securityCode: {
│       subject: 'Your security code',
│       html: (code) => `<div>..${code}..</div>`
│   }
└── fr.js
    └── emailTemplates.securityCode: {
        subject: 'Votre code de sécurité',
        html: (code) => `<div>..${code}..</div>`
    }
```

### Flux d'envoi

```
sendSecurityCodeEmail(email, code):
  1. Récupérer template (locale-aware)
  2. transporter.sendMail({
       from: process.env.MAILER_FROM,
       to: email,
       subject: template.subject,
       html: template.html(code)
     })
```

## 7. Internationalisation (i18n)

### Architecture i18n

```
src/translate/
├── en.json
│   └── {
│       "app.name": "App",
│       "nav.home": "Home",
│       "error.auth.invalidCode": "Invalid code",
│       ...
│     }
├── fr.json
│   └── {
│       "app.name": "App",
│       "nav.home": "Accueil",
│       "error.auth.invalidCode": "Code invalide",
│       ...
│     }
└── emails/
    ├── en.js → emailTemplates object
    └── fr.js → emailTemplates object
```

### Fonctionnement Vue i18n

```javascript
// src/main.js
createI18n({
  fallbackLocale: 'en',
  legacy: false,
  locale: savedLocale,
  messages: { en, fr },
});
```

### Usage dans les composants

```vue
<script setup>
const { t, locale } = useI18n();

// t('key.name') → cherche dans le fichier locale actuelle
// locale = 'fr' → change la langue
</script>

<template>
  <h1>{{ t('app.name') }}</h1>
  <!-- Affiche: "App" (en) ou "App" (fr) -->
</template>
```

## 8. Styling Architecture

### SCSS Structure

```
src/styles/
├── variables.scss
│   ├── Spacings
│   ├── Border-radius
│   ├── Shadows
│   ├── Transitions
│   └── Breakpoints
├── mixins.scss
│   ├── flex utilities
│   ├── text truncate
│   ├── transitions
│   ├── responsive
│   └── accessibility
```

### Vuetify Theme

```javascript
// src/plugins/vuetify.js
createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: { colors: { primary: '#4f46e5', ... } },
      dark: { colors: { primary: '#...' } }
    }
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { rounded: 'lg', elevation: 0, border: true }
  }
})
```

## 9. Build & Bundling (Vite)

### Vite Config

```javascript
defineConfig({
  plugins: [vue()],           // Support Vue SFC
  resolve.alias: {
    '@': resolve(__dirname, 'src')
  },
  build: {
    cssCodeSplit: false,       // CSS en un fichier
    rolldownOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash]'
      }
    }
  },
  ssr: {
    noExternal: ['vuetify']   // Vuetify inclus dans bundle SSR
  }
})
```

### Build Process

```
1. npm run build
    ↓
2. Vite build client (--ssrManifest)
    → dist/client/
    → index.html + chunks + ssr-manifest.json
    ↓
3. Vite build server (--ssr entry-server.js)
    → dist/server/entry-server.js
    ↓
4. Docker build (multi-stage)
    Stage 1 (builder):
      - Installer dépendances
      - Lancer npm run build
    Stage 2 (runner):
      - Image slim
      - Copier dist/ + server.js + package-lock.json
      - npm ci --omit=dev (dépendances prod)
```

## 10. Docker Architecture

### Multi-stage Dockerfile Production

```dockerfile
FROM node:24-alpine AS builder
  # npm ci --include=dev
  # npm run build
  → génère dist/

FROM node:24-slim AS runner
  # Copier dist/
  # npm ci --omit=dev
  # Supervisor gère le processus
  → npm run prod
```

### Docker Compose Dev

The dev compose is split into `docker-compose.yml` (base — runs the `node` app only and reads `.env`, connecting to a remote DB) and `docker-compose.local.yml` (override — adds a local `mongo` container and redirects the app to it). The active combination is driven by the `COMPOSE_FILE` variable in `.env` (set in `.env.example`): keep it set for local node + mongo, comment it out to target a remote database.

```yaml
services:
  node:
    build: docker/dev/node/
    depends_on: [mongo (healthy)]
    volumes: ['.:/app'] → hot reload
    ports: ['${BIND_ADDRESS:-127.0.0.1}:${NODE_PORT}:${NODE_PORT}']
    env_file: [.env]

  mongo:
    build: docker/dev/mongo/
    volumes: ['./docker/dev/mongo/init-scripts:/docker-entrypoint-initdb.d']
    ports: ['${BIND_ADDRESS:-127.0.0.1}:${MONGO_PORT:-27017}:27017']
    volumes: also mongo-data:/data/db
    healthcheck: → Ping MongoDB
```

## Flux de Développement

```
npm run dev
  ↓
entry point: server.js
  ↓
← dev: crée Vite dev server en middleware
← prod: Vite build + sirv serve dist/
  ↓
SSR middle ware intercepts * routes
  ↓
entry-server.js rend la page
  ↓
Client reçoit HTML complet + hydrate avec entry-client.js
  ↓
Hot Reload sur changement fichier:
  - Client: rechargement module Vite
  - Serveur: rechargement entry-server.js and src/api/** (via vite.ssrLoadModule)
  - server.js and src/api/http/**: restart needed
  - File watching uses native events; set VITE_USE_POLLING=true when bind mounts miss them
```

## Flux de Production

```
docker build → docker image
  ↓
docker run → démarrage conteneur
  ↓
Supervisor gère processus npm run prod
  ↓
Express serve dist/client/ (sirv)
  ↓
SSR rendering depuis dist/server/
  ↓
Application performante + pré-rendue
```

## Performance & Optimisations

### SSR Benefits

✅ HTML content available immédiatement
✅ Better SEO (crawlers voient le contenu)
✅ Faster First Contentful Paint
✅ Sessions server-side (pas vulnérable XSS)

### Optimisations appliquées

✅ CSS code splitting désactivé (Vite)
✅ Asset naming avec hashes
✅ Production image: Alpine → Slim (plus léger)
✅ Compression gzip Express
✅ Sirv: optimisé static serving
✅ Vuetify: inclus dans SSR bundle

## Debugging & Logging

### Logger

```javascript
// src/shared/log.js
logInfo('Database connection successful');
logError('Error...');
logWarn('Warning...');
```

Verbosity is controlled by `LOG_LEVEL` (`error`, `warn`, `info`, `debug`; default `info`). `logError` always prints.

### Environment & Watch

```bash
NODE_ENV=development npm run dev    # Mode debug
NODE_ENV=production npm run prod    # Mode optimisé

# Logs disponibles:
# - Console (stdout)
# - logs/sessions/ (sessions stockées)
```

---

Pour des questions sur l'architecture, consultez [README.fr.md](../README.fr.md)
