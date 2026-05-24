# Troubleshooting Guide

Guide de dépannage pour résoudre les problèmes courants avec e-xode-vue-ssr.

## 📋 Table des Matières

- [Installation](#installation)
- [Démarrage](#démarrage)
- [Base de Données](#base-de-données)
- [Authentification](#authentification)
- [Email](#email)
- [Build & Production](#build--production)
- [Docker](#docker)
- [Performance](#performance)
- [FAQ](#faq)

---

## 🔧 Installation

### `npm install` échoue

**Erreur:** "ERR! code E404" ou "ENOTFOUND"

**Solutions:**

1. Vérifier la connexion internet
2. Vider le cache npm:
   ```bash
   npm cache clean --force
   ```
3. Réessayer:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Dépendances manquantes

**Symptôme:** "Cannot find module 'vue'"

**Solution:**

```bash
npm install
npm list  # Vérifier toutes les dépendances
```

### Version Node incorrecte

**Symptôme:** "npm ERR! Engine! Incompatible version"

**Solution:**

```bash
node --version  # Vérifier version

# Installer Node 18+
# Avec nvm:
nvm use 18
nvm install 18
```

---

## 🚀 Démarrage

### Port 3002 déjà utilisé

**Symptôme:** "listen EADDRINUSE: address already in use :::3002"

**Solutions:**

```bash
# Option 1: Tuer le processus existant
# Linux/Mac:
lsof -ti:3002 | xargs kill -9

# Windows:
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Option 2: Utiliser un port différent
PORT=3000 npm run dev

# Option 3: Vérifier les serveurs existantes
ps aux | grep node
```

### "Cannot connect to MongoDB"

**Symptômes:**

- "connect ECONNREFUSED 127.0.0.1:27017"
- Application plante au démarrage

**Solutions:**

1. Vérifier MongoDB:

   ```bash
   # Avec Docker:
   docker ps | grep mongo

   # Démarrer si arrêté:
   docker-compose up -d mongo
   ```

2. Vérifier connection string:

   ```bash
   # .env doit avoir:
   MONGO_URI=mongodb://root:password@localhost:27017/app

   # Avec localhost ne marche pas?
   # Essayer:
   MONGO_URI=mongodb://root:password@mongo:27017/app
   ```

3. Vérifier credentials MongoDB:
   ```bash
   mongosh mongodb://root:password@localhost:27017
   ```

### Serveur démarre mais pagz blank

**Symptômes:** Page blanche, pas d'erreur console

**Solutions:**

1. Vérifier les logs:

   ```bash
   npm run dev 2>&1 | tee dev.log
   ```

2. Vérifier la console navigateur (F12):
   - Chercher erreurs JavaScript
   - Vérifier network tab

3. Vérifier Vite config:

   ```bash
   # Vite doit être en dev mode:
   npm run dev

   # Pas npm run build + npm run prod
   ```

---

## 💾 Base de Données

### "Collection doesn't exist"

**Symptôme:** Erreur lors de création utilisateur

**Solution:**

```bash
# MongoDB crée les collections automatiquement
# Sinon, créer manuellement:

mongosh mongodb://root:password@localhost:27017/app

# Dans la CLI mongosh:
db.createCollection('users')
db.createCollection('sessions')

# Créer index:
db.users.createIndex({ email: 1 }, { unique: true })
```

### Données corrompues / Migration

**Problème:** Collection avec mauvais schéma

**Solution:**

```bash
# Backup d'abord:
mongodump --uri="mongodb://root:password@localhost:27017/app" \
  -o backup

# Reset la collection:
mongosh mongodb://root:password@localhost:27017/app
> db.users.deleteMany({})
> db.users.drop()

# Ou reset la BD entière:
> db.dropDatabase()
```

### Performance lente

**Symptoms:**

- Requêtes DB prennent 10+ secondes
- Connexion timeout

**Solutions:**

1. Vérifier les indexes:

   ```bash
   mongosh mongodb://root:password@localhost:27017/app
   > db.users.getIndexes()
   ```

2. Ajouter index manquant:

   ```bash
   > db.users.createIndex({ email: 1 })
   > db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
   ```

3. Vérifier connection pool:
   ```javascript
   // Dans mongo.js:
   // Augmenter maxPoolSize si beaucoup de connexions:
   {
     maxPoolSize: 10;
   }
   ```

---

## 🔐 Authentification

### "Signup échoue - Cannot read property"

**Symptôme:** POST /api/auth/signup retourne 500

**Solution:**

1. Vérifier .env:

   ```bash
   MAILER_EMAIL=test@example.com
   MAILER_PASSWORD=your_app_password
   NODE_ENV=development
   ```

2. Vérifier body validations:

   ```bash
   # Envoyer request valide:
   {
     "email": "user@example.com",
     "password": "SecurePass123!",
     "name": "John Doe"
   }
   ```

3. Vérifier pas d'erreurs DB:
   ```bash
   # Check logs avec des détails:
   npm run dev 2>&1 | grep -i error
   ```

### "Code de vérification erroné"

**Problème:** Code correct refusé

**Symptômes:**

- Code expirée? (5 min timeout)
- Hash n'a matché pas

**Solutions:**

1. Vérifier le timeout:

   ```javascript
   // Dans verify-code.js:
   // Vérifier la durée d'expiration (5 minutes par défaut)
   const CODE_EXPIRES_IN = 5 * 60 * 1000; // 5 min
   ```

2. Tester directement dans DB:

   ```bash
   mongosh mongodb://root:password@localhost:27017/app
   > db.users.findOne({email:'test@example.com'})
   > // Vérifier fields: securityCode, securityCodeExpires
   ```

3. Resend code si expiré:
   - Cliquer "Resend Code" dans l'app

### "Session expire trop vite / pas du tout"

**Symptôme:**

- Disconnectés après 10 mins
- Jamais disconnectés

**Solution:**

1. Vérifier session config (.env):

   ```bash
   COOKIE_SECRET=your-secret-key
   NODE_ENV=production  # Important pour secure cookies
   ```

2. Vérifier backend session setup:

   ```javascript
   // server.js
   app.use(
     session({
       secret: process.env.COOKIE_SECRET,
       resave: false,
       saveUninitialized: false,
       cookie: {
         secure: process.env.NODE_ENV === 'production',
         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
       },
     })
   );
   ```

3. Augmenter session maxAge si besoin:
   ```javascript
   // maxAge en milliseconds
   maxAge: 30 * 24 * 60 * 60 * 1000; // 30 jours
   ```

---

## 📧 Email

### "Emails ne arrive pas"

**Symptômes:**

- Signup/Signin: pas de code reçu
- Pas d'erreur mais silence radio

**Solutions:**

1. Vérifier config SMTP:

   ```bash
   # .env doit avoir:
   MAILER_SERVICE=gmail  # ou autre
   MAILER_EMAIL=your-email@gmail.com
   MAILER_PASSWORD=your_app_password  # PAS votre password!
   ```

2. Gmail spécifique:
   - Activer 2FA: https://myaccount.google.com/security
   - Créer app password: https://myaccount.google.com/apppasswords
   - Utiliser le password généré dans MAILER_PASSWORD

3. Tester manuellement:

   ```bash
   node -e "
   require('dotenv').config();
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     service: process.env.MAILER_SERVICE,
     auth: {
       user: process.env.MAILER_EMAIL,
       pass: process.env.MAILER_PASSWORD
     }
   });
   transporter.sendMail({
     from: process.env.MAILER_EMAIL,
     to: 'test@example.com',
     subject: 'Test',
     html: '<p>Test</p>'
   }, (err, info) => {
     console.log(err || 'Email sent! ' + info.response);
   });
   "
   ```

4. Vérifier logs serveur:

   ```bash
   npm run dev 2>&1 | grep -i mail
   ```

5. Vérifier le code:
   ```javascript
   // email.js - vérifier sendSecurityCodeEmail
   // Ajouter logs de debug:
   console.log('Sending email to:', email);
   console.log('Subject:', subject);
   ```

### "SMTP Connection Timeout"

**Erreur:** "connect ETIMEDOUT" ou "auth errors"

**Solutions:**

1. Vérifier le service:

   ```bash
   # MAILER_SERVICE doit exister dans nodemailer
   # Options: gmail, hotmail, yahoo, outlook, etc.
   ```

2. Essayer avec config manuelle:

   ```bash
   # Au lieu de service, utiliser host/port:
   MAILER_HOST=smtp.gmail.com
   MAILER_PORT=587
   MAILER_SECURE=false
   MAILER_EMAIL=your-email@gmail.com
   MAILER_PASSWORD=app_password
   ```

3. Vérifier firewall:
   ```bash
   # Port 587 ouvert?
   telnet smtp.gmail.com 587
   ```

---

## 🏗️ Build & Production

### Build échoue - "Module not found"

**Erreur:** "Cannot find module '@/views/MyComponent.vue'"

**Solution:**

```bash
# Vérifier le chemin:
# ❌ Mauvais: import Component from '@views/Component.vue'
# ✅ Bon:    import Component from '@/views/Component.vue'

# Vérifier alias dans vite.config.js:
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

### Build lent (30+ secondes)

**Solutions:**

1. Vérifier node version:

   ```bash
   node --version  # Utiliser 18+
   ```

2. Augmenter timeout:

   ```bash
   # Linux/Mac:
   npm run build --timeout=120000

   # Ou dans vite.config.js:
   build: {
     rollupOptions: {
       output: {
         // ...
       }
     }
   }
   ```

3. Vérifier specs machine:
   ```bash
   # Être sur que vous avez RAM/CPU
   free -h  # Linux
   vm_stat  # Mac
   ```

### Bundle size énorme

**Problème:** dist/client/assets/\*.js > 1MB

**Solutions:**

1. Analyser bundle:

   ```bash
   npm install --save-dev rollup-plugin-visualizer
   ```

   Ajouter à vite.config.js:

   ```javascript
   import { visualizer } from 'rollup-plugin-visualizer';

   export default {
     plugins: [visualizer()],
   };
   ```

   Build et ouvrir stats.html

2. Lazy load routes:

   ```javascript
   // router.js
   component: () => import('@/views/Dashboard/DashboardView.vue');
   ```

3. Tree-shake unused code:
   ```bash
   # Vérifier dépendances inutilisées:
   npm ls
   npm prune
   ```

### "npm run prod" échoue

**Problème:** npm run build marche, prod échoue

**Solution:**

1. D'abord build:

   ```bash
   npm run build
   ```

2. Vérifier dist/ existe:

   ```bash
   ls -la dist/
   ```

3. Vérifier NODE_ENV:

   ```bash
   NODE_ENV=production npm run prod
   ```

4. Vérifier Vite config production:
   ```javascript
   // vite.config.js
   build: {
     outDir: 'dist',
     ssrManifest: true
   }
   ```

---

## 🐳 Docker

### "Cannot connect from container to host MongoDB"

**Erreur:** "connect ECONNREFUSED localhost:27017"

**Solution:**

Option 1: Utiliser docker-compose (recommandé):

```bash
docker-compose up
```

Option 2: Modifier connection string:

```bash
# ❌ MONGO_URI=mongodb://localhost:27017/app
# ✅ MONGO_URI=mongodb://host.docker.internal:27017/app (macOS/Windows)
# ✅ MONGO_URI=mongodb://172.17.0.1:27017/app (Linux)
```

### Docker build échoue

**Erreur:** "failed to solve with frontend dockerfile.v0"

**Solutions:**

```bash
# Vérifier Docker:
docker --version

# Rebuild cache:
docker build --no-cache -t app:latest .

# Vérifier Dockerfile:
docker build -f docker/build/Dockerfile -t app:latest .
```

### Container démarre mais crash

**Logs:** `docker logs -f container_name`

**Solutions:**

1. Vérifier .env dans container:

   ```bash
   docker exec container_name env | grep MONGO
   ```

2. Vérifier MongoDB accessible:

   ```bash
   docker exec container_name mongosh mongodb://root:pass@mongo:27017
   ```

3. Vérifier port exposé:
   ```bash
   docker port container_name
   docker ps
   ```

### "Npm install dans Docker slow"

**Solutions:**

1. Utiliser npm ci (plus vite):

   ```dockerfile
   # Dockerfile
   RUN npm ci --only=production
   ```

2. Utiliser cache layers:

   ```dockerfile
   COPY package.json package-lock.json .
   RUN npm ci --only=production
   COPY . .
   ```

3. Multi-stage build (déjà utilisé):
   ```dockerfile
   # docker/build/Dockerfile déjà optimisé
   ```

---

## ⚡ Performance

### Application lente au démarrage

**Solutions:**

1. Lazy load routes:

   ```javascript
   component: () => import('@/views/...');
   ```

2. Code splitting:

   ```javascript
   // vite.config.js
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vue': ['vue'],
           'vuetify': ['vuetify']
         }
       }
     }
   }
   ```

3. Vérifier SSR rendering time:
   ```bash
   # Dans server.js ajouter des logs:
   console.time('ssr')
   // ... renderToString
   console.timeEnd('ssr')
   ```

### Requêtes API lentes

**Solutions:**

1. Ajouter des indexes DB:

   ```bash
   mongosh
   > db.users.createIndex({ email: 1 })
   ```

2. Vérifier Network tab:
   - Chercher requests qui prennent > 1 sec
   - Check DB queries
   - Add caching si applicable

3. Exemple cache:

   ```javascript
   const cache = new Map();

   app.get('/api/data', (req, res) => {
     const cached = cache.get('key');
     if (cached && Date.now() - cached.time < 60000) {
       return res.json(cached.data);
     }
     // ... fetch fresh data
     cache.set('key', { data, time: Date.now() });
   });
   ```

---

## ❓ FAQ

### **Q: Comment changer le port par défaut?**

```bash
# De-dev:
PORT=3000 npm run dev

# Production:
PORT=3000 NODE_ENV=production npm run prod
```

### **Q: Comment debugger SSR?**

```javascript
// server.js
import { renderToString } from 'vue/server-renderer';

console.log('=== SSR DEBUG ===');
console.log('URL:', req.url);
console.log('User agent:', req.headers['user-agent']);

// Dans entry-server.js
console.log('SSR rendering app');
```

### **Q: Comment ajouter TypeScript?**

1. Installer:

   ```bash
   npm install --save-dev typescript
   ```

2. Renommer .js → .ts

3. Créer tsconfig.json

4. Mettre à jour vite.config.js

### **Q: Comment configurer HTTPS localement?**

```bash
# Créer certificats:
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Utiliser dans node:
https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app).listen(443)
```

### **Q: Comment deployer sur Heroku?**

```bash
# 1. Créer Procfile:
echo "web: npm run prod" > Procfile

# 2. Deploy:
heroku create my-app
git push heroku main

# 3. Variables d'env:
heroku config:set MONGO_URI=...
heroku config:set MAILER_PASSWORD=...
```

### **Q: Comment utiliser variables d'environnement dans Vue?**

```javascript
// Pas possible d'accéder process.env en client!
// Utiliser vite.config.js:
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
}

// Dans Vue:
const apiUrl = import.meta.env.VITE_API_URL
```

### **Q: Combien utilisateurs avant scaling?**

- Avec MongoDB Cloud free tier: ~100-500 concurrent
- Ajouter caching: ~1000
- Horizontal scaling: illimité

### **Q: Comment monitorer en production?**

```bash
# Option 1: PM2
npm install -g pm2
pm2 start server.js --name app
pm2 monit

# Option 2: Docker health checks
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3002/"]
  interval: 30s
  timeout: 10s
```

---

## 🆘 Toujours pas résolu?

1. **Vérifier logs:**

   ```bash
   npm run dev 2>&1 | tee debug.log
   docker logs -f container_name
   ```

2. **Créer issue:**
   Inclure:
   - Node version
   - Erreur complète
   - Étapes à reproduire
   - .env (sans secrets!)

3. **Stack Overflow:** Rechercher par erreur spécifique

---

**Bonne chance! 🚀**
