# CampusRate API

API REST développée avec **NestJS** et **TypeScript** qui permet de consulter des endroits du campus (bibliothèque, cafétéria, laboratoires, etc.) et de les évaluer au moyen d'avis. Les données sont persistées dans **MongoDB** avec Mongoose.

> Travail pratique 2 — cours 420-514, Cégep Marie-Victorin, automne 2026
> Auteur : Diego Fanara Alvarez

---

## Table des matières

1. [Fonctionnalités](#fonctionnalités)
2. [Technologies](#technologies)
3. [Prérequis](#prérequis)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Configuration](#configuration)
6. [Structure du projet](#structure-du-projet)
7. [Modèle de données](#modèle-de-données)
8. [Endpoints](#endpoints)
9. [Filtrage et pagination](#filtrage-et-pagination)
10. [Règles métier](#règles-métier)
11. [Validation et gestion des erreurs](#validation-et-gestion-des-erreurs)
12. [Sécurité HTTP](#sécurité-http)
13. [Documentation Swagger](#documentation-swagger)
14. [Vérification manuelle](#vérification-manuelle)
15. [Options facultatives réalisées](#options-facultatives-réalisées)
16. [Limitations connues](#limitations-connues)
17. [Workflow Git](#workflow-git)

---

## Fonctionnalités

- CRUD complet sur deux ressources : **places** (endroits) et **reviews** (avis)
- Ressource imbriquée : création et liste des avis sous `/places/{placeId}/reviews`
- Calcul automatique de la note moyenne (`averageRating`) et du nombre d'avis (`reviewCount`) d'un endroit
- Filtrage par catégorie et pagination sur la liste des endroits
- Persistance dans **MongoDB** (Mongoose)
- Validation des entrées avec `class-validator` (rejet des champs inconnus et des champs contrôlés par le serveur)
- Réponses d'erreur normalisées au format **Problem Details** (RFC 9457)
- Sécurité HTTP : Helmet, CORS, limite de taille du corps, Content-Type JSON obligatoire, limitation du débit
- Documentation interactive **Swagger / OpenAPI**

## Technologies

| Outil | Rôle |
|---|---|
| [NestJS](https://docs.nestjs.com) 12 | Framework back-end |
| TypeScript | Langage |
| MongoDB Atlas + Mongoose | Base de données et accès aux données |
| @nestjs/config + Joi | Lecture et validation des variables d'environnement |
| class-validator / class-transformer | Validation et transformation des DTO |
| @nestjs/swagger | Génération de la documentation OpenAPI |
| Helmet | En-têtes HTTP de sécurité |
| @nestjs/throttler | Limitation du débit |
| oxlint / Prettier | Qualité et formatage du code |

## Prérequis

- [Node.js](https://nodejs.org) récent (testé avec la version 24) et npm
- Un compte [MongoDB Atlas](https://www.mongodb.com/atlas) (cluster gratuit) ou un MongoDB installé localement

## Installation et démarrage

```bash
# 1. Cloner le dépôt
git clone https://github.com/DiegoFanara/TP1-CampusRate.git
cd TP1-CampusRate

# 2. Installer les dépendances
npm ci

# 3. Créer le fichier .env à partir de l'exemple, puis renseigner MONGO_URI
cp .env.example .env

# 4. Lancer l'API en mode développement (rechargement automatique)
npm run start:dev
```

L'API est ensuite accessible à l'adresse **http://localhost:3000/api/v1**.

Autres commandes utiles :

| Commande | Description |
|---|---|
| `npm run start` | Démarrage simple |
| `npm run build` | Compilation dans `dist/` |
| `npm run start:prod` | Exécution de la version compilée |
| `npm run lint` | Analyse statique avec oxlint |
| `npm run format` | Formatage avec Prettier |

## Configuration

Le fichier `.env` n'est jamais versionné. Seul `.env.example` est dans le dépôt, sans valeur sensible.

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3000` | Port d'écoute du serveur |
| `MONGO_URI` | — (obligatoire) | Chaîne de connexion MongoDB |

L'application refuse de démarrer si `MONGO_URI` est absente.

### Configurer MongoDB avec Atlas

1. Créer un compte et un cluster gratuit sur MongoDB Atlas.
2. Créer un utilisateur de base de données (nom d'utilisateur et mot de passe).
3. Dans *Network Access*, autoriser son adresse IP.
4. Dans *Connect* → *Drivers*, copier la chaîne de connexion `mongodb+srv://...`.
5. La coller dans `MONGO_URI` en ajoutant le nom de la base `campusrate` :

```
MONGO_URI=mongodb+srv://<utilisateur>:<mot-de-passe>@<cluster>.mongodb.net/campusrate?retryWrites=true&w=majority
```

Les collections `places` et `reviews` sont créées automatiquement au premier enregistrement.

## Structure du projet

```
src/
├── main.ts                  # Démarrage : Helmet, CORS, limite du corps, ValidationPipe, filtre d'erreurs, Swagger
├── app.module.ts            # Module racine : configuration, connexion MongoDB, limitation du débit
├── config/                  # Lecture de MONGO_URI
├── common/                  # Filtre d'erreurs, garde Content-Type, pipe d'identifiant, utilitaires
├── places/
│   ├── dto/                 # CreatePlaceDto, UpdatePlaceDto, QueryPlacesDto
│   ├── schemas/             # Schéma Mongoose de Place
│   ├── enums/               # PlaceCategory, PlaceStatus
│   ├── places.controller.ts
│   ├── places.module.ts
│   └── places.service.ts
└── reviews/
    ├── dto/                 # CreateReviewDto, UpdateReviewDto
    ├── schemas/             # Schéma Mongoose de Review
    ├── reviews.controller.ts
    ├── reviews.module.ts
    └── reviews.service.ts
```

## Modèle de données

### Place

| Champ | Type | Obligatoire à la création | Description |
|---|---|---|---|
| `id` | `string` (identifiant MongoDB) | généré | Identifiant unique |
| `name` | `string` | oui | Nom de l'endroit (100 caractères max) |
| `description` | `string` | oui | Description (1000 caractères max) |
| `category` | `PlaceCategory` | oui | Catégorie (voir ci-dessous) |
| `address` | `string` | oui | Emplacement, ex. local ou pavillon (200 caractères max) |
| `services` | `string[]` | non (défaut `[]`) | Services offerts (20 max, 50 caractères chacun) |
| `status` | `PlaceStatus` | non (défaut `ACTIVE`) | Statut de l'endroit |
| `averageRating` | `number \| null` | calculé | Moyenne des notes, `null` s'il n'y a aucun avis |
| `reviewCount` | `number` | calculé | Nombre d'avis |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | générés | Dates de création et de modification |

**`PlaceCategory`** : `STUDY_SPACE`, `LIBRARY`, `FOOD_SERVICE`, `SPORTS`, `STUDENT_SERVICE`, `COMPUTER_LAB`, `OTHER`

**`PlaceStatus`** : `ACTIVE`, `TEMPORARILY_CLOSED`, `INACTIVE`

### Review

| Champ | Type | Obligatoire à la création | Contraintes |
|---|---|---|---|
| `id` | `string` (identifiant MongoDB) | généré | |
| `placeId` | `string` | tiré de l'URL | Doit référencer un endroit existant |
| `authorsName` | `string` | oui | Non vide, 100 caractères max |
| `rating` | `integer` | oui | Entre 1 et 5 |
| `comment` | `string` | oui | Entre 10 et 500 caractères |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | générés | |

## Endpoints

Toutes les routes sont préfixées par **`/api/v1`**.

### Places

| Méthode | Route | Description | Succès |
|---|---|---|---|
| `POST` | `/places` | Créer un endroit | `201` |
| `GET` | `/places` | Lister les endroits (filtrage + pagination) | `200` |
| `GET` | `/places/{id}` | Consulter un endroit | `200` |
| `PATCH` | `/places/{id}` | Modifier partiellement un endroit | `200` |
| `DELETE` | `/places/{id}` | Supprimer un endroit et ses avis | `200` |

### Reviews

| Méthode | Route | Description | Succès |
|---|---|---|---|
| `POST` | `/places/{placeId}/reviews` | Ajouter un avis à un endroit | `201` |
| `GET` | `/places/{placeId}/reviews` | Lister les avis d'un endroit | `200` |
| `GET` | `/reviews/{id}` | Consulter un avis | `200` |
| `PATCH` | `/reviews/{id}` | Modifier partiellement un avis | `200` |
| `DELETE` | `/reviews/{id}` | Supprimer un avis | `200` |

> **Choix de conception :** la création et la liste des avis sont imbriquées sous l'endroit, car un avis n'existe pas sans lui. La consultation, la modification et la suppression d'un avis passent par `/reviews/{id}`, puisque l'identifiant de l'avis suffit à le retrouver.

### Exemples

**Créer un endroit**

```http
POST /api/v1/places
Content-Type: application/json

{
  "name": "Bibliothèque",
  "description": "Espace calme avec postes de travail et prêt de livres",
  "category": "LIBRARY",
  "address": "Pavillon A, local A-200",
  "services": ["Wi-Fi", "Imprimante"]
}
```

Réponse `201 Created` :

```json
{
  "id": "6acec9b38e737c7edb9ddae5",
  "name": "Bibliothèque",
  "description": "Espace calme avec postes de travail et prêt de livres",
  "category": "LIBRARY",
  "address": "Pavillon A, local A-200",
  "services": ["Wi-Fi", "Imprimante"],
  "status": "ACTIVE",
  "averageRating": null,
  "reviewCount": 0,
  "createdAt": "2026-10-14T00:15:47.352Z",
  "updatedAt": "2026-10-14T00:15:47.352Z"
}
```

**Ajouter un avis**

```http
POST /api/v1/places/6acec9b38e737c7edb9ddae5/reviews
Content-Type: application/json

{
  "authorsName": "Diego",
  "rating": 5,
  "comment": "Endroit très calme, idéal pour étudier."
}
```

## Filtrage et pagination

`GET /api/v1/places` accepte les paramètres de requête suivants :

| Paramètre | Type | Défaut | Contraintes |
|---|---|---|---|
| `category` | `PlaceCategory` | — | Valeur de l'énumération |
| `page` | `integer` | `1` | ≥ 1 |
| `limit` | `integer` | `10` | Entre 1 et 50 |

Exemple : `GET /api/v1/places?category=LIBRARY&page=1&limit=5`

```json
{
  "data": [ /* endroits */ ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 12,
    "totalPages": 3
  }
}
```

## Règles métier

- Un endroit créé sans `status` reçoit `ACTIVE` ; sans `services`, il reçoit une liste vide.
- Un avis ne peut être créé ou listé que pour un endroit existant (sinon `404`).
- `averageRating` et `reviewCount` sont **recalculés automatiquement** à chaque création, modification ou suppression d'un avis.
- Les champs contrôlés par le serveur (`id`, `averageRating`, `reviewCount`, `createdAt`, `updatedAt`) ne peuvent pas être envoyés par le client : la requête est refusée avec une erreur `400`.
- La suppression d'un endroit entraîne la **suppression en cascade** de tous ses avis.
- `updatedAt` est mis à jour à chaque modification.

## Validation et gestion des erreurs

Un `ValidationPipe` global est configuré avec :

- `whitelist: true` : retire les propriétés non déclarées dans le DTO ;
- `forbidNonWhitelisted: true` : rejette la requête si une propriété inconnue est envoyée ;
- `transform: true` : convertit les paramètres (ex. `page`, `limit`) vers leur type.

Les textes sont aussi nettoyés : les espaces au début et à la fin sont retirés avant la validation, donc un nom composé uniquement d'espaces est refusé. Les longueurs maximales sont indiquées dans le modèle de données.

Un identifiant mal formé dans l'URL donne une erreur `400`. Un identifiant bien formé qui n'existe pas donne une erreur `404`.

Toutes les erreurs passent par un filtre global (`ProblemDetailsFilter`) qui renvoie une réponse `application/problem+json` conforme à la **RFC 9457** :

```json
{
  "type": "about:blank",
  "title": "NotFound",
  "status": 404,
  "detail": "Place introuvable",
  "instance": "/api/v1/places/6acec9b38e737c7edb9ddae5"
}
```

| Code | Cas |
|---|---|
| `400 Bad Request` | Données invalides, champ inconnu ou interdit, identifiant mal formé, paramètre de requête invalide |
| `404 Not Found` | Endroit ou avis introuvable |
| `413 Payload Too Large` | Corps de la requête de plus de 10 Ko |
| `415 Unsupported Media Type` | Corps envoyé avec un Content-Type autre que `application/json` |
| `429 Too Many Requests` | Plus de 100 requêtes par minute |
| `500 Internal Server Error` | Erreur inattendue |

## Sécurité HTTP

- **Helmet** : ajoute les en-têtes de sécurité HTTP à toutes les réponses et retire `X-Powered-By`.
- **CORS** : seules les origines `http://localhost:5173` et `http://localhost:3001` sont autorisées, avec les méthodes `GET`, `POST`, `PATCH` et `DELETE` et l'en-tête `Content-Type`. La liste se modifie dans `main.ts`.
- **Taille du corps** : limitée à 10 Ko, sinon `413`.
- **Content-Type** : un corps de requête doit être en `application/json`, sinon `415`.
- **Limitation du débit** : 100 requêtes par minute par client, sinon `429` avec un en-tête `Retry-After`.

## Documentation Swagger

Une fois l'API démarrée, la documentation interactive est disponible à :

**http://localhost:3000/api/docs**

Elle est générée à partir des contrôleurs et des DTO grâce au plugin `@nestjs/swagger` (configuré dans `nest-cli.json`). Elle indique les propriétés obligatoires, les contraintes principales et les réponses d'erreur `400`, `404` et `429`.

## Vérification manuelle

Les scénarios suivants ont été vérifiés avec Swagger UI et sont montrés dans la vidéo de démonstration.

| # | Scénario | Requête | Résultat attendu |
|---|---|---|---|
| 1 | Création valide | `POST /places` avec un corps valide | `201` |
| 2 | Consultation d'une ressource persistée | `GET /places/{id}`, puis vérification du document dans MongoDB Atlas | `200` |
| 3 | Persistance après redémarrage | Arrêt et redémarrage de l'API, puis `GET /places/{id}` | `200`, mêmes données |
| 4 | Propriété obligatoire absente | `POST /places` sans `name` | `400` |
| 5 | Valeur invalide | `POST /places` avec une catégorie inconnue | `400` |
| 6 | Propriété inconnue | `POST /places` avec un champ non prévu | `400` |
| 7 | Modification valide | `PATCH /places/{id}` avec un champ valide | `200` |
| 8 | Champ contrôlé par le serveur | `PATCH /places/{id}` avec `averageRating` | `400` |

## Options facultatives réalisées

| Code | Option | Ce qui a été fait |
|---|---|---|
| H1 | Limitation du débit | `@nestjs/throttler`, 100 requêtes par minute, réponse `429` |
| H2 | Taille du corps | Limite de 10 Ko, réponse `413` au format Problem Details |
| H3 | Content-Type | Garde global qui exige `application/json`, réponse `415` |
| H5 | Méthodes autorisées | Méthodes déclarées explicitement dans la configuration CORS |
| M2 | Agrégation MongoDB | La note moyenne et le nombre d'avis sont calculés avec une agrégation (`$match`, `$group`, `$avg`) |
| M3 | Référence ou imbrication | Voir ci-dessous |
| P1 | Filtres autorisés | La liste des endroits n'accepte que `category`, `page` et `limit` ; les autres paramètres sont refusés |
| P2 | Propriétés modifiables | Seuls les champs prévus dans les DTO de modification sont acceptés |
| T1 | Rôle de HTTPS | Voir ci-dessous |

### M3 : référence plutôt qu'imbrication

Les avis sont dans une collection à part et gardent une référence vers l'endroit (`placeId`), au lieu d'être imbriqués dans le document de l'endroit. Un endroit peut recevoir beaucoup d'avis, et l'imbrication ferait grossir son document sans limite. De plus, un avis se consulte, se modifie et se supprime seul grâce à `/reviews/{id}`. Le prix à payer : il faut supprimer les avis à la main quand un endroit est supprimé, et calculer la note moyenne avec une agrégation.

### T1 : rôle de HTTPS

HTTPS est HTTP transporté dans une connexion chiffrée (TLS). Il empêche quelqu'un qui intercepte le trafic de lire ou de modifier les requêtes et les réponses, et il permet au client de vérifier l'identité du serveur grâce à un certificat. En pratique, c'est ce qui protège les mots de passe, les jetons et les données échangées. Ici, l'API tourne en HTTP en local, et un déploiement réel devrait être placé derrière HTTPS.

## Limitations connues

- Pas d'authentification : n'importe quel client peut créer, modifier et supprimer des endroits et des avis.
- Les origines CORS sont écrites dans `main.ts`, elles ne changent pas selon l'environnement.
- La limitation du débit se base sur l'adresse IP du client, ce qui est moins précis derrière un proxy ou quand plusieurs personnes partagent la même adresse.
- L'API fonctionne seulement en HTTP en local.
- Les erreurs inattendues venant de Mongoose sont renvoyées en `500` sans être traduites.
- Pas de tests automatisés : la vérification est manuelle.

## Workflow Git

Le projet suit le workflow par branches et issues vu en classe :

- une **issue parente** (#16) pour le TP, avec des sous-issues pour chaque tâche : MongoDB et Mongoose (#17), validation (#18), sécurité HTTP (#19), documentation (#20) et options facultatives (#24) ;
- une branche de fonctionnalité `feature/16-campusrate-tp2` et une branche par tâche (ex. `task/17-mongodb-mongoose`) ;
- des commits qui référencent l'issue concernée (`refs #N`) ;
- une Pull Request de chaque tâche vers la branche de fonctionnalité, puis une Pull Request finale vers `main` ; les branches fusionnées sont conservées comme trace.