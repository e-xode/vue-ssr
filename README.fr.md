# Vue 3 SSR Starter Kit

Un starter kit complet et moderne pour créer des applications web avec **Vue 3**, **Server-Side Rendering (SSR)**, authentification, et MongoDB.

🇬🇧 **[English version](./README.en.md)**

## 📋 Table des matières

- [Caractéristiques](#-caractéristiques)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [API REST](#-api-rest)
- [Authentification](#-authentification)
- [Internationalisation (i18n)](#-internationalisation-i18n)
- [Styling](#-styling)
- [Base de données](#-base-de-données)
- [Docker](#-docker)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 Caractéristiques

### Frontend
- ✅ **Vue 3** - Framework JavaScript progressif avec Composition API
- ✅ **Server-Side Rendering (SSR)** - Rendu côté serveur pour une meilleure SEO
- ✅ **Vite** - Bundler ultra-rapide et serveur de développement
- ✅ **Vue Router 5** - Routage côté client avec support SSR
- ✅ **Pinia** - Gestion d'état robuste
- ✅ **Vuetify 4** - Composants Material Design complets
- ✅ **SCSS** - Variables globales, mixins et thèmes
- ✅ **Vue i18n** - Support multi-langues (EN, FR)

### Backend
- ✅ **Express.js** - Framework web minimaliste
- ✅ **MongoDB** - Base de données NoSQL flexible
- ✅ **Authentification sécurisée** - Email/password avec vérification par code
- ✅ **Sessions** - Gestion sécurisée des sessions utilisateur
- ✅ **Nodemailer** - Envoi d'emails intégré
- ✅ **CORS & Validation** - Configuration de sécurité
- ✅ **Routage avec préfixe locale** - URLs SEO-friendly avec préfixe `/:locale(en|fr)/`
- ✅ **Page de contact** - Formulaire de contact avec endpoint API, validation, rate limiting
- ✅ **Helmet CSP** - Content Security Policy configurée
- ✅ **Vérification de code sécurisée** - Hachage SHA-256 avec timingSafeEqual

### Infrastructure
- ✅ **Docker & Docker Compose** - Conteneurisation complète
- ✅ **GitHub Actions** - CI/CD automatisé
- ✅ **Supervisor** - Gestion des processus en production

## 🏗️ Architecture

### Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│                    Vue 3 + Vuetify UI                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      (HTTP/REST API)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Express Server (Node.js)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Entry Point: entry-server.js (SSR Renderer)       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  API Routes: /api/auth, /api/...                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Middleware: Session, CORS, Validation             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                          │
│            Collections: users, sessions, etc.               │
└─────────────────────────────────────────────────────────────┘
```

### Structure des Répertoires

```
e-xode.vue-ssr/
├── src/                          # Code source
│   ├── api/                      # Routes API REST
│   │   ├── auth/                # Endpoints authentification
│   │   │   ├── me.js            # Récupérer utilisateur connecté
│   │   │   ├── signup.js        # Inscription
│   │   │   ├── signin.js        # Connexion
│   │   │   ├── verify-code.js   # Vérifier code de sécurité
│   │   │   ├── resend-code.js   # Renvoyer le code
│   │   │   └── signout.js       # Déconnexion
│   │   ├── middleware.js        # Middleware (auth, validation)
│   │   └── router.js            # Registre des routes
│   ├── components/              # Composants Vue réutilisables
│   │   └── layout/              # Composants de layout
│   │       ├── TheHeader.vue    # En-tête
│   │       ├── TheFooter.vue    # Pied de page
│   │       └── index.js         # Export des composants
│   ├── stores/                  # Pinia stores
│   │   ├── auth.js              # Store authentification
│   │   └── index.js             # Export des stores
│   ├── views/                   # Pages/Views
│   │   ├── Index/               # Page d'accueil
│   │   ├── Auth/                # Pages authentification
│   │   ├── Dashboard/           # Tableau de bord
│   │   └── NotFound/            # Page 404
│   ├── shared/                  # Utilitaires partagés
│   │   ├── log.js               # Logger
│   │   ├── mongo.js             # Connexion MongoDB
│   │   └── email.js             # Service d'emailing
│   ├── plugins/                 # Plugins Vue
│   │   └── vuetify.js           # Configuration Vuetify
│   ├── styles/                  # Styles globaux
│   │   ├── variables.scss       # Variables SCSS
│   │   └── mixins.scss          # Mixins SCSS
│   ├── translate/               # Traductions i18n
│   │   ├── en.json              # Traduction anglais
│   │   ├── fr.json              # Traduction français
│   │   └── emails/              # Templates emails
│   ├── App.vue                  # Composant racine
│   ├── App.scss                 # Styles App.vue
│   ├── router.js                # Configuration Vue Router
│   ├── main.js                  # Initialisation l'app
│   ├── entry-client.js          # Point d'entrée client
│   ├── entry-server.js          # Point d'entrée SSR
│   ├── style.css                # Styles globaux CSS
│   └── json/                    # Données JSON statiques
├── docker/                      # Configuration Docker
│   ├── build/                   # Image production
│   │   ├── Dockerfile          # Dockerfile multi-stage production
│   │   └── config/
│   │       └── supervisord.conf # Configuration Supervisor
│   └── dev/                     # Images développement
│       ├── node/                # Conteneur Node.js dev
│       │   ├── Dockerfile      # Dockerfile dev Node
│       │   └── run.sh          # Script démarrage dev
│       └── mongo/               # Conteneur MongoDB
│           ├── Dockerfile      # Dockerfile MongoDB
│           └── init-scripts/    # Scripts initialisation DB
├── .github/                     # Configuration GitHub
│   └── workflows/               # GitHub Actions
│       └── docker-build.yml     # Build et push Docker
├── logs/                        # Logs et sessions
├── dist/                        # Build production (généré)
├── node_modules/                # Dépendances npm (ignoré git)
├── package.json                 # Dépendances et scripts npm
├── vite.config.js               # Configuration Vite
├── server.js                    # Serveur Express principal
├── index.html                   # Template HTML principal
├── docker-compose.yml           # Orchestration Docker
├── env_sample                   # Exemple variables d'env
├── .env                         # Variables d'environnement (local)
├── .gitignore                   # Fichiers ignorés git
├── README.fr.md                 # Cet fichier
├── README.en.md                 # Documentation en anglais
└── docs/                        # Documentation supplémentaire
    ├── ARCHITECTURE.md          # Architecture détaillée
    ├── API.md                   # Documentation API
    ├── AUTHENTICATION.md        # Flux authentification
    ├── DEPLOYMENT.md            # Guide déploiement
    └── TROUBLESHOOTING.md       # Dépannage
```

## 📋 Prérequis

### Minimum requis
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0.0 (ou accès à une instance)

### Recommandé pour Docker
- **Docker** >= 20.0
- **Docker Compose** >= 1.29.0

## 📦 Installation

### Option 1: Développement local sans Docker

1. **Cloner le projet**
```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp env_sample .env
```

Éditer `.env` avec vos paramètres:
```env
NODE_PORT=5173
NODE_HOST=http://localhost:5173

# Base de données MongoDB
MONGO_DB=app
MONGO_HOST=localhost:27017
MONGO_USER=user
MONGO_PWD=password
MONGO_TYPE=mongodb

# Serveur email (Nodemailer)
MAILER_HOST=smtp.example.com
MAILER_PORT=587
MAILER_SSL=false
MAILER_FROM=noreply@example.com
MAILER_LOGIN=your@email.com
MAILER_PASSWORD=app_password

# Sécurité
COOKIE_SECRET=your-secret-key
```

4. **Démarrer MongoDB**
```bash
# Sur macOS avec Homebrew
brew services start mongodb-community

# Ou avec Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=user \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

### Option 2: Développement avec Docker Compose

1. **Créer un réseau Docker (si n'existe pas)**
```bash
docker network create e-xode
```

2. **Cloner et configurer**
```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
cp env_sample .env
```

3. **Démarrer les conteneurs**
```bash
docker-compose up -d
```

Les services seront disponibles à:
- Application: http://localhost:5173
- MongoDB: localhost:27017

## ⚙️ Configuration

### Variables d'environnement

```env
# Mode d'exécution
NODE_ENV=development|production

# Serveur Node.js
NODE_PORT=5173                    # Port du serveur
NODE_HOST=http://localhost:5173   # URL base du serveur

# MongoDB
MONGO_TYPE=mongodb                # Type de connexion
MONGO_HOST=localhost:27017        # Hôte:Port MongoDB
MONGO_DB=app                      # Nom de la base de données
MONGO_USER=user                   # Utilisateur MongoDB
MONGO_PWD=password                # Mot de passe MongoDB

# Nodemailer (Email)
MAILER_HOST=smtp.gmail.com        # Serveur SMTP
MAILER_PORT=587                   # Port SMTP
MAILER_SSL=false|true             # Utiliser SSL/TLS
MAILER_FROM=app@example.com       # Email source
MAILER_LOGIN=user@gmail.com       # Identifiant SMTP
MAILER_PASSWORD=app_password      # Mot de passe SMTP

# Sécurité
COOKIE_SECRET=change-me           # Secret pour les cookies sessions
```

### Configuration Vuetify

Éditer [src/plugins/vuetify.js](src/plugins/vuetify.js) pour personnaliser:
- **Thème** (light/dark)
- **Couleurs** (primary, secondary, etc.)
- **Composants** (defaults)

### Configuration Vite

Éditer [vite.config.js](vite.config.js) pour:
- Alias de chemins
- Paramètres de build
- Proxy API
- Variables d'environnement

## 🚀 Démarrage rapide

### Développement

```bash
# Sans Docker
npm run dev

# Avec Docker Compose
docker-compose up

# Application accessible à http://localhost:5173
```

### Build pour production

```bash
# Compiler client et serveur
npm run build

# Télécharger optionnel: compilé dans dist/
# - dist/client/    → Bundle client
# - dist/server/    → Bundle serveur
```

### Exécution production

```bash
# Localement
npm run prod

# Avec Docker
docker-compose -f docker-compose.yml up
```

## 📁 Structure du projet

### Points d'entrée (Entrypoints)

#### `src/entry-client.js`
Point d'entrée côté client. Hydrate l'application Vue montée côté serveur.

#### `src/entry-server.js`
Point d'entrée SSR. Rend l'application en HTML et génère les meta tags.

#### `src/main.js`
Initialise l'application Vue avec:
- Vue Router
- Pinia (state management)
- Vue i18n (multi-langues)
- Vuetify (composants)

#### `server.js`
Serveur Express principal qui:
- Gère les sessions
- Crée les routes API
- Effectue le rendu SSR
- Sert les assets statiques

### Flux de requête

```
Requête HTTP
    ↓
Express Middleware (session, CORS, JSON)
    ↓
Routeur API (/api/*)
    ↓
Middleware de sécurité
    ↓
Handler (Base de données)
    ↓
Réponse JSON
    ↓
Client (Pinia store → Composant Vue)
```

### Flux de rendu SSR

```
Requête page (ex: /)
    ↓
entry-server.js
    ↓
Vue Router navigue
    ↓
Charge la page
    ↓
renderToString() génère HTML
    ↓
Génère meta tags SEO
    ↓
Retourne HTML complet
    ↓
Browser reçoit + hydrate
```

## 🔌 API REST

### Authentification

#### `POST /api/auth/signup`
Inscription utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "status": "verification_pending",
  "email": "user@example.com"
}
```

---

#### `POST /api/auth/signin`
Connexion utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "status": "verification_pending",
  "email": "user@example.com"
}
```

---

#### `POST /api/auth/verify-code`
Vérifier le code de sécurité

**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### `POST /api/auth/resend-code`
Renvoyer le code de sécurité

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "status": "code_sent",
  "email": "user@example.com"
}
```

---

#### `GET /api/auth/me`
Récupérer l'utilisateur connecté

**Response (200):**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

#### `POST /api/auth/signout`
Déconnexion

**Response (200):**
```json
{
  "status": "success"
}
```

### Gestion d'erreurs

Toutes les erreurs retournent:

```json
{
  "error": "error.key.code"
}
```

Les codes d'erreur sont localisés. Consultez `src/translate/en.json` pour voir tous les codes disponibles.

## 🔐 Authentification

### Flux d'authentification

```
1. Utilisateur saisit email/password
    ↓
2. Client POST /api/auth/signup ou /api/auth/signin
    ↓
3. Serveur valide, hash le password (bcryptjs)
    ↓
4. Génère code 6 chiffres (10 min expiration)
    ↓
5. Envoie email avec le code
    ↓
6. Utilisateur entre le code
    ↓
7. Client POST /api/auth/verify-code
    ↓
8. Serveur valide le code
    ↓
9. Crée session utilisateur
    ↓
10. Retourne profil utilisateur
    ↓
11. Client stocke dans store Pinia
```

### Sécurité

- ✅ Passwords hashés avec bcryptjs (cost: 10)
- ✅ Codes de sécurité hasés en Base64
- ✅ Sessions stockées (fichier local dev, Redis en prod)
- ✅ Cookies HTTP-only et Secure en HTTPS
- ✅ Validation des inputs serveur
- ✅ CORS configuré
- ✅ CSRF protection (via cookies)

### Sessions

Les sessions utilisateur sont stockées dans:
- **Développement**: `logs/sessions/*.json`
- **Production**: À configurer (Redis recommandé)

Configuration dans `server.js`:
```javascript
const sessionMiddleware = session({
  store: new fileStore({ path: 'logs/sessions' }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 jours
    sameSite: 'lax',
    secure: isProduction,               // HTTPS seulement en prod
    httpOnly: true,
    path: '/'
  },
  name: 'ssr.sid',
  resave: false,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET
})
```

## 🌍 Internationalisation (i18n)

### Langues supportées

- 🇬🇧 Anglais (en)
- 🇫🇷 Français (fr)

### Fichiers traductions

- [src/translate/en.json](src/translate/en.json) - Chaînes anglais
- [src/translate/fr.json](src/translate/fr.json) - Chaînes français
- [src/translate/emails/en.js](src/translate/emails/en.js) - Templates emails EN
- [src/translate/emails/fr.js](src/translate/emails/fr.js) - Templates emails FR

### Utilisation

Dans les composants Vue:

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>

<template>
  <div>
    <!-- Utiliser une traduction -->
    <h1>{{ t('app.name') }}</h1>

    <!-- Changer de langue -->
    <button @click="locale = 'en'">English</button>
    <button @click="locale = 'fr'">Français</button>
  </div>
</template>
```

Dans le JavaScript:

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
console.log(t('nav.home'))
```

### Structure des traductions

```json
{
  "app": {
    "name": "App",
    "byAuthor": "Par l'auteur"
  },
  "nav": {
    "home": "Accueil",
    "dashboard": "Tableau de bord"
  },
  "error": {
    "unauthorized": "Non autorisé",
    "auth": {
      "invalidCode": "Code invalide"
    }
  }
}
```

### Ajouter une nouvelle langue

1. Créer `src/translate/xx.json` (xx = code langue)
2. Copier la structure de `en.json`
3. Traduire toutes les valeurs
4. Importer dans `src/main.js`:
```javascript
import xx from '@/translate/xx.json'

const i18n = createI18n({
  messages: { en, fr, xx }
})
```

## 🎨 Styling

### Architecture SCSS

```
src/styles/
├── variables.scss    # Espacements, border-radius, breakpoints
└── mixins.scss       # Utilitaires SCSS
```

### Variables disponibles

```scss
// Espacements
$spacing-unit: 8px;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border-radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

### Mixins disponibles

```scss
@include flex-center;              // Centre avec flexbox
@include flex-between;             // Space-between
@include flex-col;                 // Flex column
@include truncate;                 // Ellipsis une ligne
@include multiline-truncate(3);    // Ellipsis multi-lignes
@include absolute-center;          // Position absolue centrée
@include transition;               // Transition fluide
@include hover-lift;               // Effet élévation au hover
@include respond-to('md') { };     // Media query
@include visually-hidden;          // Accessible hidden text
```

### Exemple d'utilisation

```vue
<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/mixins';

.card {
  @include transition(transform, box-shadow);
  border-radius: $border-radius-lg;
  padding: $spacing-lg;

  &:hover {
    @include hover-lift;
  }

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}
</style>
```

### Thème Vuetify

Personnalisez les couleurs dans [src/plugins/vuetify.js](src/plugins/vuetify.js):

```javascript
const colors = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#06b6d4',
  success: '#00c853',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // ... plus de couleurs
}
```

## 🗄️ Base de données

### MongoDB

#### Configuration

```env
MONGO_TYPE=mongodb
MONGO_HOST=localhost:27017
MONGO_DB=app
MONGO_USER=user
MONGO_PWD=password
```

#### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: string,              // Unique
  password: string,           // Hashed (bcryptjs)
  name: string,
  createdAt: Date,
  updatedAt: Date,
  securityCode: string,       // Hashed
  securityCodeExpires: Date,
  securityCodeAttempts: int   // Limiter les tentatives
}
```

#### Connexion

Le fichier [src/shared/mongo.js](src/shared/mongo.js) gère la connexion:

```javascript
import { mongoConnect } from '#src/shared/mongo.js'

const { db, error } = await mongoConnect()
if (error) {
  console.error('Erreur connexion DB:', error)
}

// Utiliser la connexion
const users = await db.collection('users').find({}).toArray()
```

#### Initialisation de la base

Pour charger des données initiales, créer un script dans:
- `docker/dev/mongo/init-scripts/init-db.js`

Exemple:
```javascript
db.createCollection('users')
db.users.createIndex( { "email": 1 }, { unique: true } )
```

## 🐳 Docker

### Configuration Docker Compose

```yaml
services:
  node:
    # Serveur Node.js avec Vite dev server
    # Port: 5173
    # Volumes: Tout le projet (hot reload)

  mongo:
    # MongoDB dev
    # Port: 27017
    # Volumes: Données persistées
```

### Images Docker

#### Node.js Dev (`docker/dev/node/Dockerfile`)
- Base: `node:22-slim`
- Inclut: Dépendances pour Playwright
- Point d'entrée: `npm run dev`

#### MongoDB Dev (`docker/dev/mongo/Dockerfile`)
- Base: Image MongoDB officielle
- Initialise la base et utilisateurs
- Scripts custom disponibles

#### Production Image (`docker/build/Dockerfile`)
- Build multi-étape
- Base: `node:22-alpine` + `node:22-slim`
- Optimisée pour production
- Utilise Supervisor

### Commandes Docker

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f node
docker-compose logs -f mongo

# Accéder au bash du conteneur Node
docker-compose exec node /bin/bash

# Accéder à la CLI MongoDB
docker-compose exec mongo mongosh
```

### Build production

```bash
# Construire l'image
docker build -f docker/build/Dockerfile -t e-xode-vue-ssr:latest .

# Tester localement
docker run -p 5173:5173 \
  -e NODE_ENV=production \
  -e NODE_PORT=5173 \
  e-xode-vue-ssr:latest
```

## 🚀 Déploiement

### Préparation

- [ ] Définir les variables d'environnement en production
- [ ] Configurer MongoDB en production
- [ ] Paramétrer le service d'email
- [ ] Générer un `COOKIE_SECRET` sécurisé
- [ ] Activer HTTPS (cookies secure: true)
- [ ] Configurer le backup MongoDB
- [ ] Mettre en place monitoring/logging

### Déploiement via Docker

#### 1. Push image vers registry

```bash
# GitHub Container Registry
docker build -f docker/build/Dockerfile \
  -t ghcr.io/yourusername/e-xode-vue-ssr:latest .

docker push ghcr.io/yourusername/e-xode-vue-ssr:latest
```

#### 2. Serveur de déploiement

```bash
# SSH vers le serveur
ssh user@prod-server.com

# Cloner le projet
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr

# Créer .env production
nano .env

# Lancer avec Docker Compose
docker-compose up -d
```

### Variables d'environnement production

```env
NODE_ENV=production
NODE_PORT=3006
NODE_HOST=https://yourdomain.com

MONGO_HOST=production-mongo:27017
MONGO_DB=app
MONGO_USER=produser
MONGO_PWD=strong_password_here

MAILER_HOST=smtp.sendgrid.net
MAILER_PORT=587
MAILER_FROM=noreply@yourdomain.com
MAILER_LOGIN=apikey
MAILER_PASSWORD=your_sendgrid_api_key

COOKIE_SECRET=generate_strong_random_value_here
```

### Reverse Proxy (Nginx)

```nginx
upstream app {
    server localhost:5173;
}

server {
    listen 80;
    server_name yourdomain.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring

Intégrer des services comme:
- **Datadog** - APM et monitoring
- **Sentry** - Error tracking
- **ELK Stack** - Logs centralisés

### Backup MongoDB

```bash
# Backup automatique (cron job)
0 2 * * * mongodump --uri="mongodb://user:pwd@host:27017/app" \
  --out="/backups/mongo/$(date +\%Y\%m\%d)" \
  --gzip --archive="/backups/mongo/app-$(date +\%Y\%m\%d).archive"
```

## 📚 Guides supplémentaires

Pour plus de détails, consultez:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture détaillée
- [API.md](docs/API.md) - Documentation API complète
- [AUTHENTICATION.md](docs/AUTHENTICATION.md) - Flux authentification
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Guide déploiement complet
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Dépannage

## 🛠️ Development

### Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer serveur dev + Vite

# Build
npm run build             # Compiler client et serveur
npm run build:client      # Compiler client seulement
npm run build:server      # Compiler serveur seulement

# Production
npm run prod              # Lancer serveur production
```

### Ajouter une nouvelle page

1. Créer composant dans `src/views/MyPage/MyPageView.vue`
2. Ajouter route dans `src/router.js`
3. Ajouter traductions dans `src/translate/*.json`

### Ajouter un nouvel endpoint API

1. Créer fichier `src/api/myfeature/action.js`
2. Exporter fonction `setupMyFeatureRoute(app, db)`
3. Importer et registrer dans `src/api/router.js`

### Ajouter un nouveau store Pinia

1. Créer `src/stores/feature.js`
2. Exporter depuis `src/stores/index.js`
3. Utiliser dans composants: `import { useFeatureStore } from '@/stores'`

## 🚨 Dépannage

### Envoi d'emails ne fonctionne pas

**Vérifier:**
```bash
# Variables d'environnement
cat .env | grep MAILER

# Logs du serveur
npm run dev
# Chercher "Email send error"

# Accès serveur SMTP
# Exemple: Gmail nécessite "App passwords", pas le mot de passe normal
```

### MongoDB inaccessible

```bash
# Vérifier la connexion
docker-compose logs mongo | grep "error"

# Redémarrer MongoDB
docker-compose restart mongo

# Vérifier disponibilité
mongosh mongodb://localhost:27017/app -u user -p password
```

### Problème de hot reload

```bash
# Augmenter watchers
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Erreur "Address already in use"

```bash
# Trouver le processus utilisant le port
lsof -i :5173
kill -9 <PID>

# Ou changer le port dans .env
NODE_PORT=5174
```

## 🤝 Contribution

Les contributions sont bienvenues! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence **MIT**. Voir [LICENSE](./LICENSE) pour détails.

## 📞 Support

Pour des questions ou problèmes:
- 📧 Email: support@example.com
- 🐛 Signaler un bug: [GitHub Issues](https://github.com/yourusername/e-xode-vue-ssr/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/e-xode-vue-ssr/discussions)

---

**Créé avec ❤️**
