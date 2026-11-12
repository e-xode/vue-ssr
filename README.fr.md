# Vue SSR Starter Kit

[![npm](https://img.shields.io/npm/v/@e-xode/vue-ssr)](https://www.npmjs.com/package/@e-xode/vue-ssr)
[![tests](https://github.com/e-xode/vue-ssr/actions/workflows/npm-test.yml/badge.svg)](https://github.com/e-xode/vue-ssr/actions/workflows/npm-test.yml)
[![licence](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Un point de départ prêt pour la production pour les applications Vue 3 rendues côté serveur : SSR
avec Express 5, authentification par code email, panneau d'administration, i18n anglais/français,
Vuetify 4, MongoDB et Docker, avec le durcissement de sécurité et les tests déjà écrits.

Démo : <https://vue-ssr.e-xode.net> · English version: [README.md](./README.md)

## Pourquoi ce kit

La plupart des modèles Vue SSR s'arrêtent à un « hello world » rendu par le serveur. Celui-ci
fournit ce que tout projet réel finit par écrire :

- **Une authentification terminée.** Inscription, connexion avec code à 6 chiffres envoyé par
  email, réinitialisation du mot de passe, changement d'email, avatar, rotation de session, durées
  de vie d'inactivité et absolue, blocage d'IP et de comptes.
- **Un panneau d'administration.** Utilisateurs (recherche, édition, blocage, suppression), IP
  bloquées et journal d'audit filtrable.
- **Un SSR prêt pour le SEO.** Routes préfixées par la langue (`/en/…`, `/fr/…`), liens canoniques
  et `hreflang`, Open Graph, JSON-LD, `sitemap.xml` et `robots.txt`, codes HTTP corrects.
- **La sécurité par défaut.** CSP Helmet sans script `unsafe-inline` en production, limitation de
  débit, reCAPTCHA v3, codes hachés comparés en temps constant, entrées typées contre l'injection
  d'opérateurs NoSQL.
- **Un code lisible.** De petits modules, pas de code mort, un `server.js` minimal et plus de 300
  tests unitaires.

## Stack

| Couche   | Technologie                                                              |
| -------- | ------------------------------------------------------------------------ |
| Frontend | Vue 3 (`<script setup>`), Vue Router 5, Pinia 3, Vuetify 4, vue-i18n 11  |
| Serveur  | Node.js 26, Express 5, Vite 8 (build SSR et middleware de développement) |
| Données  | MongoDB (driver officiel), sessions sur fichiers                         |
| Email    | Nodemailer (SMTP), transport console en développement                    |
| Qualité  | Vitest 4, ESLint 10, Prettier 3, GitHub Actions                          |

## Démarrage rapide (5 minutes)

Prérequis : Docker avec le plugin Compose. Rien d'autre : Node.js et MongoDB tournent dans des
conteneurs.

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
cp .env.example .env
docker compose up
```

Ouvrez <http://localhost:3002>. Le premier démarrage installe les dépendances et prend une à deux
minutes.

1. **Créez un compte** sur la page d'inscription.
2. **Lisez le code de sécurité dans les logs du serveur.** Aucun serveur SMTP n'est configuré en
   développement, les emails ne sont donc pas envoyés : le code s'affiche dans la sortie de
   `docker compose up` (cherchez une ligne se terminant par `code for vous@example.com: 123456`).
3. **Devenez administrateur**, puis déconnectez-vous et reconnectez-vous :

   ```bash
   docker compose exec node npm run seed:admin -- vous@example.com
   ```

Les valeurs par défaut de `.env.example` fonctionnent telles quelles. Voir
[docs/QUICK_START.fr.md](./docs/QUICK_START.fr.md) pour travailler sans Docker, utiliser un MongoDB
distant ou envoyer de vrais emails.

## Scripts

| Commande                        | Rôle                                                                        |
| ------------------------------- | --------------------------------------------------------------------------- |
| `npm run dev`                   | Serveur de développement avec HMR Vite (charge `.env`)                      |
| `npm run build`                 | Bundles client et serveur de production dans `dist/`                        |
| `npm start`                     | Serveur de production (alias de `npm run prod`) ; attend les variables de production |
| `npm test`                      | Tests unitaires, une fois (`npm run test:run` est identique ; `test:watch` surveille) |
| `npm run test:coverage`         | Tests unitaires avec rapport de couverture                                  |
| `npm run lint:check`            | ESLint en lecture seule (`npm run lint` / `lint:fix` corrige aussi)         |
| `npm run format:check`          | Prettier en lecture seule (`npm run format` / `format:write` écrit aussi)   |
| `npm run validate`              | La batterie complète : lint, format, build et tests, sans modifier de fichier |
| `npm run validate:changed`      | Les mêmes contrôles limités à vos modifications non commitées, avec correction automatique |
| `npm run seed:admin -- <email>` | Promouvoir un compte existant en administrateur                             |

Avec Docker, préfixez une commande par `docker compose exec node`, par exemple
`docker compose exec node npm test`.

## Documentation

Hormis ce fichier et le [démarrage rapide](./docs/QUICK_START.fr.md), la documentation est en
anglais :

| Guide                                        | Contenu                                                   |
| -------------------------------------------- | --------------------------------------------------------- |
| [Architecture](./docs/ARCHITECTURE.md)       | Cycle d'une requête, SSR, routage, structure des fichiers |
| [Guide du développeur](./docs/DEVELOPER_GUIDE.md) | Ajouter une page, une route d'API, une traduction    |
| [Référence de l'API](./docs/API.md)          | Tous les endpoints, avec charges utiles, erreurs et limites |
| [Authentification](./docs/AUTHENTICATION.md) | Parcours, sessions, codes, blocage                        |
| [Déploiement](./docs/DEPLOYMENT.md)          | Variables d'environnement, image Docker, pièges de production |
| [Dépannage](./docs/TROUBLESHOOTING.md)       | Erreurs courantes et leurs solutions                      |
| [Tests](./TESTING.md)                        | Lancer et écrire des tests                                |
| [Contribuer](./CONTRIBUTING.md)              | Conventions et processus de pull request                  |
| [Politique de sécurité](./.github/SECURITY.md) | Signaler une vulnérabilité                              |

## Avant la mise en production

Le serveur refuse de démarrer en production tant que la configuration n'est pas sûre, et deux
comportements surprennent les nouveaux venus. Lisez [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) ;
en résumé :

- `NODE_HOST` doit être l'origine publique en `https` et `COOKIE_SECRET` une valeur aléatoire d'au
  moins 32 caractères.
- Le SMTP (`MAILER_*`) est obligatoire : les codes de sécurité ne sont affichés dans les logs qu'en
  développement.
- **Les clés reCAPTCHA v3 sont obligatoires.** Sans `RECAPTCHA_SECRET_KEY`, l'inscription et le
  formulaire de contact sont refusés.
- **Chaque redémarrage déconnecte tous les utilisateurs.** Les sessions sont des fichiers effacés
  au démarrage, et ce stockage ne supporte qu'une seule instance.

## Utiliser le kit pour votre projet

Forkez ou clonez le dépôt, puis renommez-le : `APP_NAME` dans `.env`, le `name` de `package.json`,
les textes de `src/translate/`, les icônes de `public/` et le thème dans `src/plugins/vuetify.js`.
Le dépôt fournit aussi une configuration [Claude Code](https://claude.com/claude-code) (`CLAUDE.md`,
`.claude/`) qui décrit les conventions aux assistants IA ; supprimez-la si vous ne l'utilisez pas.

## Licence

[MIT](./LICENSE)
