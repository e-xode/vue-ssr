# Démarrage Rapide

Lancer le projet en 5 minutes! 🚀

## 📋 Prérequis

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local ou Docker)

## Option 1: Sans Docker (Le plus simple)

### 1. Cloner et installer

```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
npm install
```

### 2. Configurer l'environnement

```bash
cp env_sample .env
```

Éditer `.env` avec vos paramètres (ou laisser par défaut pour le dev):

```env
NODE_PORT=5173
NODE_HOST=http://localhost:5173
MONGO_HOST=localhost:27017
MONGO_DB=app
MONGO_USER=root
MONGO_PWD=password
```

### 3. Démarrer MongoDB

```bash
# Avec Homebrew (macOS)
brew services start mongodb-community

# Ou avec Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Ou avec Docker Compose
docker-compose up mongo
```

### 4. Démarrer l'app

```bash
npm run dev
```

✅ Application accessible à: **http://localhost:5173**

---

## Option 2: Avec Docker Compose (Recommandé)

### 1. Prérequis Docker

```bash
# Créer le réseau Docker
docker network create e-xode

# Vérifier Docker & Docker Compose
docker --version
docker-compose --version
```

### 2. Cloner et configurer

```bash
git clone https://github.com/yourusername/e-xode-vue-ssr.git
cd e-xode-vue-ssr
cp env_sample .env
```

### 3. Lancer les services

```bash
docker-compose up -d
```

### 4. Vérifier que ça fonctionne

```bash
# Voir les logs
docker-compose logs -f node

# Vérifier MongoDB
docker-compose logs mongo
```

✅ Application accessible à: **http://localhost:5173**

---

## Tester l'authentification

### 1. Accéder à la page d'inscription

Allez à: http://localhost:5173/signup

### 2. S'inscrire

- Email: `test@example.com`
- Password: `TestPassword123!`
- Name: `Test User`

Cliquez "Sign Up"

### 3. Configuration email (OPTIONNEL)

Par défaut, les emails ne s'envoient pas. Pour les activer:

```env
MAILER_HOST=smtp.gmail.com
MAILER_PORT=587
MAILER_FROM=your-email@gmail.com
MAILER_LOGIN=your-email@gmail.com
MAILER_PASSWORD=app_specific_password
```

💡 **Note**: Gmail requires "App Specific Passwords" (not your regular password)

### 4. Vérification (pour dev sans email)

1. Cliquez "Resend Code" pour voir le code dans les logs
2. Ou accédez MongoDB directement:

```bash
mongosh mongodb://root:password@localhost:27017/app

# Dans la console MongoDB:
db.auth('admin', 'password')
db.users.findOne({email: 'test@example.com'})
```

⚠️ Vous verrez le code hasé dans `securityCode`
Dans les logs du serveur vous verrez: `Email send error` (normal si pas configuré)

---

## Scripts npmdisponibles

```bash
# Développement
npm run dev              # Démarrer serveur dev

# Build
npm run build            # Compiler pour production
npm run build:client     # Compiler client seulement
npm run build:server     # Compiler serveur seulement

# Production
npm run prod             # Démarrer en mode production
```

---

## Commandes Docker

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f node    # Logs de l'app
docker-compose logs -f mongo   # Logs MongoDB

# Accéder au terminal du conteneur
docker-compose exec node bash

# Redémarrer un service
docker-compose restart node
```

---

## Explorer l'app

### Pages disponibles

- **`/`** - Accueil
- **`/signup`** - Inscription
- **`/signin`** - Connexion
- **`/auth/verify-code`** - Vérifier code (après signup/signin)
- **`/dashboard`** - Tableau de bord (connecté)

### Code Explorer

```
src/
├── views/                # Pages
│   ├── Index/IndexView.vue
│   ├── Auth/SignupView.vue
│   ├── Auth/SigninView.vue
│   └── ...
├── components/           # Composants
│   └── layout/TheHeader.vue
├── stores/               # État (Pinia)
│   └── auth.js
├── api/                  # Routes API
│   └── auth/signup.js
└── translate/            # Traductions
    └── en.json
```

---

## Problèmes courants

### ❌ "Port 5173 already in use"

```bash
# Tuer le processus
lsof -i :5173
kill -9 <PID>

# Ou changer le port
# Éditer .env: NODE_PORT=5174
```

### ❌ "MongoDB connection refused"

```bash
# Vérifier que MongoDB run
docker ps | grep mongo

# Redémarrer
docker-compose restart mongo

# Ou lancer MongoDB
docker run -d -p 27017:27017 mongo:latest
```

### ❌ "Cannot GET /"

```bash
# Attendre que le serveur soit complètement prêt
# Vérifier les logs
docker-compose logs node

# Peut prendre 10-20s pour démarrer en premier
```

### ❌ Hot reload ne fonctionne pas

```bash
# C'est du Vite, il faut trop de watchers en Docker
# Solution: éditer le fichier et rafraîchir le navigateur

# Ou: augmenter les limites
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Prochaines étapes

- 📖 Lire [README.fr.md](../README.fr.md) pour la documentation complète
- 🏗️ Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'architecture
- 🔌 Explorer [API.md](./API.md) pour les endpoints
- 🚀 Consulter [DEPLOYMENT.md](./DEPLOYMENT.md) pour le déploiement

---

## Besoin d'aide?

```bash
# Voir tous les logs
docker-compose logs -f

# Arrêter et nettoyer
docker-compose down
docker-compose down -v  # Avec supression volumes

# Rebuild les images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Bonne chance! 🎉

---

**Créé avec ❤️**
