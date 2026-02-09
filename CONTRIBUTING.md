# Contributing Guide

Merci d'avoir l'intérêt de contribuer à **e-xode-vue-ssr**! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

- [Code of Conduct](#code-of-conduct)
- [Avant de Commencer](#avant-de-commencer)
- [Comment Contribuer](#comment-contribuer)
- [Process Pull Request](#process-pull-request)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)
- [Support](#support)

## 🤝 Code of Conduct

Nous nous engageons à fournir un environnement accueillant et inclusif pour tous les contributeurs. Tous les contributeurs doivent respecter ce code:

- **Respectez les opinions différentes** - les discussions constructives font avancer les projets
- **Restez professionnel** - pas de harcèlement, d'insultes ou de discrimination
- **Soyez inclusif** - bienvenue à tous les niveaux de compétences
- **Signalez les problèmes** - contacter les mainteneurs directement pour les COC violations

Les violations peuvent entraîner l'exclusion du projet.

## 🚀 Avant de Commencer

### Prérequis

- Node.js 18+
- MongoDB 5.0+
- Git
- Un peu de familiarité avec Vue 3 et Express.js

### Configuration Locale

```bash
# 1. Fork le repository sur GitHub

# 2. Cloner votre fork
git clone https://github.com/YOUR_USERNAME/e-xode-vue-ssr.git
cd e-xode-vue-ssr

# 3. Ajouter upstream
git remote add upstream https://github.com/e-xode/e-xode-vue-ssr.git

# 4. Installer les dépendances
npm install

# 5. Configurer l'environnement
cp env_sample .env

# 6. Démarrer MongoDB
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# 7. Vérifier que tout fonctionne
npm run lint:check  # Check code style
npm run test:run    # Run tests

# 8. Lancer le dev
npm run dev
```

### Synchroniser avec Upstream

```bash
# Avant de créer une branche
git fetch upstream
git rebase upstream/main
```

## 💡 Comment Contribuer

### Types de Contributions

#### 🐛 Signaler un Bug

1. **Vérifier les issues existantes** - chercher des doublons
2. **Créer une nouvelle issue** avec:
   - Description claire du bug
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Version Node, navigateur, OS
   - Screenshots/logs si applicable

```markdown
## Description
[Description du bug]

## Étapes de reproduction
1. Aller à...
2. Cliquer sur...
3. Voir l'erreur...

## Comportement attendu
[Ce qui devrait se passer]

## Comportement réel
[Ce qui se passe vraiment]

## Environnement
- Node: 18.0.0
- OS: macOS 13.0
- Navigateur: Chrome 120
```

#### ✨ Proposer une Feature

1. **Ouvrir une discussion** avant de coder
2. **Créer une issue** avec le label `enhancement`:
   - Description claire du besoin
   - Cas d'usage / pourquoi c'est utile
   - Implémentation proposée (optionnel)
   - Alternatives considérées

#### 📖 Améliorer la Documentation

Documentation! Les corrections/améliorations sont toujours bienvenues:

- Typos et clarifications dans README
- Ajouts dans les guides de setup
- Exemples de code
- Traductions en d'autres langues

Pas besoin de permission - créer directement une PR!

#### 🧹 Code Quality & Tests

- Optimisations de performance
- Refactoring sans changement de behavior
- Amélioration du style/structure

## 🔄 Process Pull Request

### 1. Créer une Branche

```bash
# Synchroniser avec upstream
git fetch upstream
git rebase upstream/main

# Créer une branche descriptive
git checkout -b feat/user-authentication
# ou
git checkout -b fix/login-redirect-bug
# ou
git checkout -b docs/setup-guide
```

**Conventions de nommage:**
- `feat/` - nouvelle feature
- `fix/` - correction de bug
- `docs/` - documentation
- `refactor/` - sans changement de behavior
- `perf/` - optimisations

### 2. Faire vos Changements

```bash
# Éditer les fichiers
# Faire des tests locaux
npm run build
npm run prod

# Stage les changements
git add .

# Commiter (voir section Commit Messages)
git commit -m 'feat: add email verification'
```

**Bonnes pratiques:**

- ✅ Faire des commits logiques et séparés
- ✅ Tester vos changements localement
- ✅ Ajouter traductions i18n si texte utilisateur
- ✅ Mettre à jour la documentation
- ❌ Ne pas commiter de secrets/credentials
- ❌ Ne pas commiter de dépendances non-packagées

### 3. Push vers votre Fork

```bash
git push origin feat/user-authentication
```

### 4. Ouvrir une Pull Request

Sur GitHub:
1. Aller à votre fork
2. Cliquer "Compare & pull request"
3. Remplir le template PR:

```markdown
## Description
Que fait cette PR? Quel problème résout-elle?

## Type de Changement
- [ ] Bug fix (changement backward-compatible qui corrige un issue)
- [ ] New feature (changement backward-compatible qui ajoute une fonctionnalité)
- [ ] Breaking change (fix ou feature qui change le comportement existant)
- [ ] Documentation update

## Comment tester
Étapes pour tester les changements:
1. Faire X
2. Vérifier Y

## Checklist
- [ ] Code stylisé (npm run lint:check passant)
- [ ] Tests passants (npm run test:run passant)
- [ ] Routes i18n tests (si changement UI)
- [ ] Documentation mise à jour
- [ ] Tests locaux passants
- [ ] Pas de warnings de build
- [ ] i18n translations addées (FR + EN)
- [ ] Pas de secrets commitées
```

### 5. Révision & Itération

- Maintainers reveraient le code
- Demandes de changements possibles
- Pas d'inquiétude si questions - c'est normal!
- Faire les changements demandés
- Repousser les changements (auto-update de la PR)
- Tagger le reviewer: "Ready for re-review"

### 6. Merge

Une fois approuvée, un maintainer mergera votre PR. Bravo! 🎉

**Après le merge:**
```bash
# Nettoyer localement
git checkout main
git pull upstream main
git branch -D feat/user-authentication
```

## ✍️ Commit Messages

Format Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat:` nouvelle feature
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatting (pas de logique change)
- `refactor:` restructuration
- `perf:` amélioration de performance
- `test:` ajout de tests
- `chore:` outils, dépendances

### Exemples

```
feat(auth): add email verification with security codes

Add email-based authentication with 6-digit security codes.
Includes code generation, expiration (5 mins), and resend logic.

Fixes #123
```

```
fix(router): resolve SSR hydration mismatch

Server rendered different route than client.
Now using consistent route matching on both sides.

Fixes #456
```

```
docs(setup): add MongoDB configuration guide

Add detailed instructions for MongoDB setup,
including Docker and local installation options.
```

### Tips

- ✅ Première ligne: brève et descriptive
- ✅ Impératif: "add" pas "added" ou "adds"
- ✅ Référencer les issues: "Fixes #123"
- ✅ Expliquer le pourquoi, pas le comment
- ❌ Ne pas répéter dans la description ce qui est dans le titre

## 🎨 Style Guide

### JavaScript/Vue

```javascript
// ✅ Bon
export function setupUserRoute(app, db) {
  app.post('/api/users', async (req, res) => {
    const { email, name } = req.body

    try {
      const user = await db.collection('users').insertOne({
        email,
        name,
        createdAt: new Date()
      })
      res.status(201).json(user)
    } catch (err) {
      console.error('User creation error:', err)
      res.status(500).json({ error: 'error.server' })
    }
  })
}

// ❌ Mauvais
export function setupUserRoute(app, db) {
  app.post('/api/users', (req, res) => {
    let user = db.collection('users').insertOne(req.body)
    res.json({ ok: true, user })
  })
}
```

### Vue Components

```vue
<!-- ✅ Bon -->
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const count = ref(0)

const isPositive = computed(() => count.value > 0)

const increment = () => {
  count.value++
}
</script>

<template>
  <div class="counter">
    <button @click="increment">
      {{ t('counter.increment') }}
    </button>
    <p :class="{ positive: isPositive }">{{ count }}</p>
  </div>
</template>

<style lang="scss" scoped>
.counter {
  text-align: center;

  button {
    padding: 8px 16px;
  }

  p.positive {
    color: green;
  }
}
</style>

<!-- ❌ Mauvais -->
<template>
  <div>
    <b @click="c++">Click me</b>
    <i>{{ c }}</i>
  </div>
</template>

<script>
export default {
  data() {
    return { c: 0 }
  }
}
</script>
```

### CSS/SCSS

```scss
// ✅ Bon
.card {
  @include flex-center;
  padding: $spacing-lg;
  border-radius: $border-radius-md;

  @include transition(all);
  @include hover-lift;

  &__title {
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  @include respond-to('md') {
    padding: $spacing-xl;
  }
}

// ❌ Mauvais
.card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  border-radius: 4px;
}

.cardTitle {
  font-weight: 600;
  margin-bottom: 8px;
}
```

## 📝 Documentation

- Utiliser Markdown
- Garder simple et scannable
- Ajouter exemples de code
- Traduire contenu important (FR + EN)
- Vérifier les liens

## ✅ Quality Checks Before Commit

### Code Linting & Formatting

Assurez-vous que le code respecte les standards du projet:

```bash
# Check linting issues
npm run lint:check

# Fix automatically
npm run lint
```

Cela vérifie:
- ✅ Vue 3 best practices
- ✅ Code formatting consistency
- ✅ No console.log in production code
- ✅ Proper import statements

### Running Tests

Tous les changements doivent passer les tests:

```bash
# Run tests in watch mode (interactive)
npm test

# Run once (for CI/CD)
npm run test:run

# Check coverage
npm run test:coverage
```

**For new features:**
- ✅ Add unit tests in `tests/unit/`
- ✅ Follow existing test patterns
- ✅ Aim for 70%+ coverage
- See [TESTING.md](./TESTING.md) for guidelines

**PR Checklist:**
- [ ] `npm run lint:check` passes (no errors)
- [ ] `npm run test:run` passes (all tests green)
- [ ] New features have tests
- [ ] Coverage didn't decrease

## 🧪 Testing Before Submit

```bash
# Install dépendances
npm install

# Run lint checks
npm run lint:check

# Run all tests
npm run test:run

# Test manualmente
npm run dev
# Tester manuellement: signup, signin, verify code, dashboard

# Build
npm run build
npm run prod
# Re-tester flux une fois

# Vérifier pas d'erreurs build
# Vérifier pas de console warnings/errors
# Tester sur mobile (DevTools)
```

## 🆘 Support

Vous êtes stuck? Demander de l'aide!

- **Issues:** Ouvrir une issue avec `question` label
- **Discussions:** Utiliser GitHub Discussions
- **Email:** Contacter les mainteneurs
- **Discord/Slack:** Si le projet en a un

Ne pas hésiter - les bonnes questions aident tout le monde!

## 📚 Ressources Additionnelles

- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Quick Start Guide](./QUICK_START.en.md)
- [Main README](../README.en.md)

## License

En contributant, vous acceptez que vos contributions soient sous la même license que le projet.

---

Merci d'avoir amélioré e-xode-vue-ssr! 🙌
