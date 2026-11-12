# Démarrage rapide

English version: [QUICK_START.en.md](./QUICK_START.en.md)

## Avec Docker (recommandé)

Prérequis : Docker avec le plugin Compose (`docker compose version`).

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
cp .env.example .env
docker compose up
```

`COMPOSE_FILE` dans `.env` sélectionne deux fichiers : `docker-compose.yml` (le conteneur Node.js)
et `docker-compose.local.yml` (un conteneur MongoDB 8, dont l'utilisateur applicatif est créé au
premier démarrage à partir de `MONGO_USER`, `MONGO_PWD` et `MONGO_DB`). L'application écoute sur
<http://localhost:3002> et MongoDB sur `127.0.0.1:27017` ; les deux ports ne sont publiés que sur
l'interface locale.

Le conteneur Node.js lance `npm install` à son premier démarrage (puis à chaque changement de
`package-lock.json`), puis `npm run dev`.

### Premier compte et premier administrateur

1. Ouvrez <http://localhost:3002/fr/signup> et créez un compte.
2. Le code de sécurité s'affiche dans les logs du serveur, car aucun serveur SMTP n'est configuré :

   ```
   [mail:dev] … code for vous@example.com: 123456
   ```

3. Promouvez le compte, puis déconnectez-vous et reconnectez-vous :

   ```bash
   docker compose exec node npm run seed:admin -- vous@example.com
   ```

Il n'existe ni compte administrateur par défaut, ni mot de passe par défaut.

### Pourquoi le conteneur de développement a des privilèges étendus

`docker-compose.yml` accorde au conteneur Node.js la capacité `SYS_ADMIN`, un profil seccomp non
confiné et 2 Go de mémoire partagée. Ils servent uniquement à faire tourner Chromium sans interface
(Playwright, utilisé par l'outillage optionnel de captures d'écran) dans le conteneur. Ils ne sont
pas nécessaires à l'application : supprimez les clés `cap_add`, `security_opt` et `shm_size` si
vous n'utilisez pas Playwright. L'image de production n'en a aucun.

### Variantes utiles

| Besoin                                    | À modifier dans `.env`                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Port 27017 ou 3002 déjà utilisé           | `MONGO_PORT=27018`, `NODE_PORT=3003` (et `NODE_HOST` en conséquence)                      |
| MongoDB distant (Atlas, autre serveur)    | Commentez `COMPOSE_FILE`, renseignez `MONGO_HOST` et `MONGO_TYPE=mongodb+srv`             |
| Accéder au serveur depuis une autre machine | `BIND_ADDRESS=0.0.0.0`                                                                  |
| Rejoindre un réseau Docker existant       | Ajoutez `:docker-compose.network.yml` à `COMPOSE_FILE` et renseignez `SHARED_NETWORK=<nom>` |
| Envoyer de vrais emails                   | Décommentez et renseignez les variables `MAILER_*`                                        |

## Sans Docker

Prérequis : Node.js 26 (un fichier `.nvmrc` est fourni) et un serveur MongoDB accessible.

```bash
git clone https://github.com/e-xode/vue-ssr.git
cd vue-ssr
npm install
cp .env.example .env
```

Modifiez `.env` :

- Commentez `COMPOSE_FILE` (il ne concerne que Docker Compose).
- Pointez `MONGO_HOST` vers votre serveur (`localhost` ou `localhost:27017`).
- Pour un MongoDB local **sans authentification**, laissez `MONGO_USER` et `MONGO_PWD` vides.
- Pour un MongoDB **avec authentification**, l'utilisateur doit être défini dans la base `MONGO_DB`
  elle-même : la chaîne de connexion est `mongodb://user:password@host/app`, MongoDB authentifie
  donc sur `app` et non sur `admin`. Un utilisateur root créé avec `MONGO_INITDB_ROOT_USERNAME`
  vit dans `admin` et sera refusé. Créez l'utilisateur applicatif une fois :

  ```bash
  mongosh "mongodb://localhost/app" --eval \
    'db.createUser({ user: "user", pwd: "password", roles: [{ role: "readWrite", db: "app" }] })'
  ```

Puis :

```bash
npm run dev
npm run seed:admin -- vous@example.com
```

## Pour aller plus loin

Le reste de la documentation est en anglais :

- [Guide du développeur](./DEVELOPER_GUIDE.md) : ajouter une page, une route d'API, une traduction.
- [Déploiement](./DEPLOYMENT.md) : ce qu'exige la production.
- [Dépannage](./TROUBLESHOOTING.md) : quand quelque chose ne démarre pas.
