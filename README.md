# API Bibliothèque

API REST pour la gestion d'une bibliothèque numérique avec authentification JWT.

## Description

Cette API permet de gérer une bibliothèque numérique avec des fonctionnalités de CRUD sur les livres, auteurs et catégories. Elle inclut un système d'authentification JWT avec refresh tokens et une gestion des rôles utilisateurs (USER/ADMIN).

## Technologies utilisées

- Node.js + Express
- PostgreSQL (base de données relationnelle)
- Prisma (ORM)
- JWT (authentification)
- Bcrypt (hashage des mots de passe)
- Swagger (documentation API)
- Docker (conteneurs PostgreSQL + Node.js)

## Structure du projet

```
bibliotheque-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── swagger.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   └── routes/
│       ├── auth.js
│       ├── books.js
│       ├── authors.js
│       └── categories.js
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env
└── package.json
```

## Installation

### Option 1 : Avec Docker (Recommandé)

Tout est automatisé, il suffit d'une seule commande.

#### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd bibliotheque-api
```

#### 2. Lancer avec Docker Compose

```bash
docker-compose up --build
```

Cette commande va :
- Créer le conteneur PostgreSQL
- Créer le conteneur Node.js
- Installer les dépendances
- Appliquer les migrations Prisma
- Insérer les données initiales (seed)
- Démarrer le serveur

Le serveur démarre automatiquement sur `http://localhost:3001`

Pour arrêter :
```bash
docker-compose down
```

Pour tout supprimer (conteneurs + volumes) :
```bash
docker-compose down -v
```

---

### Option 2 : Sans Docker (Développement local)

Si tu préfères lancer Node.js directement sur ta machine.

#### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd bibliotheque-api
```

#### 2. Installer les dépendances

```bash
npm install
```

#### 3. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bibliotheque"
JWT_SECRET="votre_secret_jwt_ici"
JWT_REFRESH_SECRET="votre_secret_refresh_ici"
PORT=3001
```

#### 4. Lancer la base de données

```bash
docker-compose up -d postgres
```

#### 5. Générer les tables Prisma

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/bibliotheque" npx prisma generate
```

#### 6. Appliquer les migrations

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/bibliotheque" npx prisma migrate dev
```

#### 7. (Optionnel) Insérer des données initiales

```bash
npm run seed
```

#### 8. Lancer le serveur

```bash
npm start
```

ou en mode développement :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## Documentation API

La documentation Swagger est accessible à : `http://localhost:3001/api-docs`

Une interface de test simple est disponible à : `http://localhost:3001`

## Intégration IA (Groq Cloud)

L'API intègre Groq Cloud pour enrichir les fonctionnalités avec de l'intelligence artificielle :

- **Génération automatique de descriptions** : Si aucune description n'est fournie lors de la création d'un livre, l'IA en génère une automatiquement
- **Résumés de livres** : `GET /api/v1/books/:id/summarize` génère un résumé captivant du livre
- **Recommandations** : `GET /api/v1/books/:id/recommend` suggère 3 livres similaires
- **Affichage automatique** : Les recommandations sont incluses dans la liste des livres (`GET /api/v1/books`)

## Endpoints principaux

### Authentification

- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion (retourne access token et refresh token)
- `POST /api/v1/auth/refresh` - Renouvellement du token d'accès
- `GET /api/v1/auth/profile` - Profil utilisateur (protégé)
- `POST /api/v1/auth/logout` - Déconnexion

### Livres

- `GET /api/v1/books` - Liste des livres avec recommandations IA (public)
- `GET /api/v1/books/:id` - Un livre avec résumé et recommandations IA (public)
- `POST /api/v1/books` - Créer un livre (ADMIN)
- `PUT /api/v1/books/:id` - Modifier un livre (ADMIN)
- `DELETE /api/v1/books/:id` - Supprimer un livre (ADMIN)
- `GET /api/v1/books/:id/summarize` - Générer un résumé IA (public)
- `GET /api/v1/books/:id/recommend` - Obtenir des recommandations IA (public)

### Auteurs

- `GET /api/v1/authors` - Liste des auteurs (public)
- `GET /api/v1/authors/:id` - Un auteur (public)
- `POST /api/v1/authors` - Créer un auteur (ADMIN)
- `PUT /api/v1/authors/:id` - Modifier un auteur (ADMIN)
- `DELETE /api/v1/authors/:id` - Supprimer un auteur (ADMIN)

### Catégories

- `GET /api/v1/categories` - Liste des catégories (public)
- `GET /api/v1/categories/:id` - Une catégorie (public)
- `POST /api/v1/categories` - Créer une catégorie (ADMIN)
- `PUT /api/v1/categories/:id` - Modifier une catégorie (ADMIN)
- `DELETE /api/v1/categories/:id` - Supprimer une catégorie (ADMIN)

## Authentification

Pour accéder aux routes protégées, ajouter le header :

```
Authorization: Bearer <votre_token>
```

### Durée des tokens

- Access token : 15 minutes
- Refresh token : 7 jours

## Sécurité

- Hashage des mots de passe avec bcrypt (10 rounds)
- JWT pour l'authentification
- Refresh token avec rotation
- Rate limiting (100 requêtes/15min pour l'API générale, 5 requêtes/15min pour login/register)
- Gestion des rôles (USER/ADMIN)
- Middleware de gestion globale des erreurs
- Variables d'environnement pour les secrets

## Rate Limiting

- API générale : 100 requêtes par 15 minutes
- Login/Register : 5 requêtes par 15 minutes

## Commandes utiles

```bash
# Démarrer le serveur
npm start

# Mode développement avec nodemon
npm run dev

# Ouvrir Prisma Studio (interface graphique de la DB)
npm run studio

# Insérer des données de test
npm run seed
```

## Architecture de la base de données

### User
- id (Integer)
- email (String, unique)
- password (String, hashé)
- role (Enum: USER, ADMIN)
- createdAt (DateTime)

### RefreshToken
- id (Integer)
- token (String, unique)
- userId (Integer)
- expiresAt (DateTime)
- createdAt (DateTime)

### Author
- id (Integer)
- name (String)
- biography (Text, optionnel)
- birthDate (DateTime, optionnel)

### Category
- id (Integer)
- name (String)

### Book
- id (Integer)
- title (String)
- description (Text, optionnel)
- publishedDate (DateTime, optionnel)
- available (Boolean)
- authorId (Integer)
- categoryId (Integer)
- createdAt (DateTime)

## Compte Admin par défaut (après seed)

```
Email: admin@bibliotheque.com
Password: admin123
```

## Gestion des erreurs

L'API retourne des codes HTTP appropriés :

- 200 : Succès
- 201 : Création réussie
- 400 : Requête invalide
- 401 : Non authentifié
- 403 : Non autorisé
- 404 : Ressource non trouvée
- 500 : Erreur serveur


