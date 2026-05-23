# Guide du Développeur

Guide complet pour développer sur le projet e-xode-vue-ssr.

## 🎯 Principes du Projet

- **Vue 3 + SSR**: Rendu côté serveur pour meilleure SEO
- **Type-safe**: JavaScript standard (ajoutez TypeScript si besoin)
- **Modulaire**: Code scopé et réutilisable
- **i18n-first**: Tous les textes localisés
- **Responsive**: Mobile-first design

## 📋 Stack Technique

| Domaine  | Technologie                   |
| -------- | ----------------------------- |
| Frontend | Vue 3, Vite, Vuetify 3, Pinia |
| Backend  | Express.js, Node.js           |
| Database | MongoDB 5.0+                  |
| Styling  | SCSS, Material Design         |
| Email    | Nodemailer                    |
| Auth     | bcryptjs, sessions            |
| i18n     | vue-i18n                      |
| Server   | Supervisor, Docker            |

## 🏠 Structure du Projet

```
src/
├── api/                       # Backend API
├── components/                # Composants Vue réutilisables
├── stores/                    # État global (Pinia)
├── views/                     # Pages/routes principales
├── shared/                    # Utils partagés
├── plugins/                   # Plugins Vue
├── styles/                    # Styles globaux
├── translate/                 # i18n translations
├── App.vue                    # Composant racine
├── router.js                  # Configuration routes
├── main.js                    # Initialisation app
├── entry-client.js            # Point d'entrée client
└── entry-server.js            # Point d'entrée SSR
```

## 🚀 Démarrer le Développement

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Démarrer MongoDB (Docker recommandé)
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# 4. Lancer le serveur dev
npm run dev

# 5. Ouvrir http://localhost:5173
```

## 📝 Ajouter une Nouvelle Page

### 1. Créer le composant

```
src/views/MyFeature/MyFeatureView.vue
```

```vue
<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <v-container class="mt-6">
    <h1>{{ t('myFeature.title') }}</h1>
    <!-- Votre contenu ici -->
  </v-container>
</template>
```

### 2. Ajouter la route

Éditer `src/router.js`:

```javascript
{
  path: '/my-feature',
  name: 'MyFeature',
  component: () => import('@/views/MyFeature/MyFeatureView.vue'),
  meta: {
    layout: 'public',
    title: 'meta.myFeature.title',
    description: 'meta.myFeature.description'
  }
}
```

### 3. Ajouter les traductions

Éditer `src/translate/en.json` et `src/translate/fr.json`:

```json
{
  "meta": {
    "myFeature": {
      "title": "My Feature",
      "description": "My feature description"
    }
  },
  "myFeature": {
    "title": "My Feature"
  }
}
```

### 4. Ajouter à la navigation (optionnel)

Éditer `src/components/layout/TheHeader.vue`

## 🔌 Ajouter un Nouvel Endpoint API

### 1. Créer le handler

```
src/api/myfeature/create.js
```

```javascript
export function setupCreateMyFeatureRoute(app, db) {
  app.post('/api/myfeature/create', async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'error.validation.nameRequired' });
    }

    try {
      const result = await db.collection('myfeatures').insertOne({
        name,
        createdAt: new Date(),
      });

      res.status(201).json({
        _id: result.insertedId,
        name,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Create error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
```

### 2. Registrer la route

Éditer `src/api/router.js`:

```javascript
import { setupCreateMyFeatureRoute } from './myfeature/create.js';

export function registerApiRoutes(app, db) {
  // ... autres routes
  setupCreateMyFeatureRoute(app, db);
}
```

### 3. Utiliser dans le frontend

```javascript
// Dans un composant o store
const response = await fetch('/api/myfeature/create', {
  method: 'POST',
  credentials: 'include', // Important pour les sessions
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test' }),
});

const data = await response.json();
```

## 📦 Ajouter un Nouveau Store Pinia

### 1. Créer le store

```
src/stores/myfeature.js
```

```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMyFeatureStore = defineStore('myfeature', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const isEmpty = computed(() => items.value.length === 0);

  async function fetchItems() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/myfeature/list');
      if (response.ok) {
        const data = await response.json();
        items.value = data.items;
      } else {
        error.value = 'Failed to fetch';
      }
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createItem(name) {
    const response = await fetch('/api/myfeature/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      const data = await response.json();
      items.value.push(data);
      return { status: 'success', data };
    } else {
      const data = await response.json();
      return { status: 'error', error: data.error };
    }
  }

  return {
    items,
    loading,
    error,
    isEmpty,
    fetchItems,
    createItem,
  };
});
```

### 2. Exporter du index

Éditer `src/stores/index.js`:

```javascript
export { useMyFeatureStore } from './myfeature';
```

### 3. Utiliser dans les composants

```vue
<script setup>
import { useMyFeatureStore } from '@/stores';
import { onMounted } from 'vue';

const store = useMyFeatureStore();

onMounted(() => {
  store.fetchItems();
});
</script>

<template>
  <div>
    <div v-if="store.loading">Chargement...</div>
    <div v-if="store.error" class="error">{{ store.error }}</div>
    <div v-for="item in store.items" :key="item._id">
      {{ item.name }}
    </div>
  </div>
</template>
```

## 🎨 Stylisation

### Utiliser les variables SCSS

```vue
<style lang="scss" scoped>
@import '@/styles/variables';
@import '@/styles/mixins';

.card {
  padding: $spacing-lg;
  border-radius: $border-radius-lg;

  @include transition(all);

  &:hover {
    @include hover-lift;
  }

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}
</style>
```

### Utiliser Vuetify

```vue
<template>
  <v-card class="pa-4">
    <v-card-title>Title</v-card-title>
    <v-card-text>Content</v-card-text>
    <v-card-actions>
      <v-btn size="small">Cancel</v-btn>
      <v-btn color="primary">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
```

## 🌍 i18n - Ajouter une Traduction

### 1. Ajouter la clé

`src/translate/en.json`:

```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

`src/translate/fr.json`:

```json
{
  "myFeature": {
    "title": "Ma Fonctionnalité",
    "description": "Ceci est ma fonctionnalité"
  }
}
```

### 2. Utiliser dans les composants

```vue
<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('myFeature.title') }}</h1>
    <p>{{ t('myFeature.description') }}</p>
  </div>
</template>
```

### 3. Utiliser dans le JavaScript

```javascript
import { useI18n } from 'vue-i18n';

export function setupMyRoute(app, db) {
  app.post('/api/my', async (req, res) => {
    // ...
    console.log('Error:', t('error.validation.invalid'));
  });
}
```

## 🧪 Testing (Recommandé)

### Test API endpoint

```bash
# Terminal
curl -X POST http://localhost:5173/api/myfeature/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Ou avec Postman/Insomnia
POST http://localhost:5173/api/myfeature/create
Content-Type: application/json

{"name":"Test"}
```

### Test composant

```vue
<script>
// Vérifier le rendu SSR
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';

// Vous pouvez tester via le navigateur dev tools
// Vérifier que le HTML est bien rendu côté serveur
</script>
```

## 🐛 Debugging

### Logs serveur

```bash
# Voir les logs du serveur de dev
npm run dev

# Avec Docker
docker-compose logs -f node

# Chercher erreurs spécifiques
docker-compose logs node | grep -i error
```

### Browser DevTools

```javascript
// Dans la console Firefox/Chrome
localStorage.setItem('locale', 'fr'); // Changer langue
```

### MongoDB

```bash
# Accéder à la CLI MongoDB
mongosh mongodb://root:password@localhost:27017/app

# Requêtes utiles
db.users.find()
db.users.findOne({email: 'test@example.com'})
db.users.updateOne({_id: ObjectId('...')}, {$set: {name: 'New'}})
db.users.deleteOne({email: 'test@example.com'})
```

## 🚀 Build & Déploiement

### Build local

```bash
npm run build

# Génère:
# - dist/client/   → bundle client
# - dist/server/   → bundle serveur
```

### Test production local

```bash
# Compiler
npm run build

# Lancer production build
npm run prod

# Accéder à http://localhost:5173
```

### Préparation déploiement

1. **Credentials sensibles**
   - Ne JAMAIS commiter `.env`
   - Utiliser variables d'environnement de prod
   - Générer nouveau `COOKIE_SECRET`

2. **Tests**

   ```bash
   npm run build
   npm run prod
   # Tester tous les flux: signup, signin, verify, signout
   ```

3. **Cleanup git**
   ```bash
   # Vérifier .gitignore
   git status
   git diff --cached
   ```

## 📚 Ressources Utiles

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Vuetify 3 Components](https://vuetifyjs.com/en/components/)
- [Pinia Store](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)

## 🤝 Contribution

Avant de soumettre une PR:

1. **Fork le projet**
2. **Créer une branche**
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Faire les changements**
   - Respecter le code style
   - Ajouter traductions i18n
   - Tester localement
4. **Commiter avec messages clairs**
   ```bash
   git commit -m 'feat: add new feature'
   ```
5. **Push et faire une PR**
   ```bash
   git push origin feature/my-feature
   ```

## Code Style Guide

### Nommage

```javascript
// ❌ Mauvais
const fn = () => {};
const a = 'test';

// ✅ Bon
const handleClick = () => {};
const userName = 'test';
```

### Vue Components

```vue
<!-- ✅ Bon -->
<script setup>
import { ref } from 'vue';

const count = ref(0);

const increment = () => count.value++;
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### API Handlers

```javascript
// ✅ Bon
export function setupMyRoute(app, db) {
  app.post('/api/path', async (req, res) => {
    try {
      // Logique
      res.json({ data });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'error.server' });
    }
  });
}
```

## ✅ Checklist avant PR

- [ ] Code stylisé et lisible
- [ ] Pas de warnings/errors
- [ ] Tests locaux passants
- [ ] Traductions i18n addées (FR + EN)
- [ ] `git status` clean
- [ ] Message commit descriptif
- [ ] Documentation mise à jour

---

Bénéficiant à tous! 🎉
