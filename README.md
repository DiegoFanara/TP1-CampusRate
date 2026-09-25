# CampusRate API

API REST développée avec **NestJS** et **TypeScript** qui permet de consulter des endroits du campus (bibliothèque, cafétéria, laboratoires, etc.) et de les évaluer au moyen d'avis. Les données sont persistées dans un fichier JSON local.

> Travail pratique 1 — cours 420-514, Cégep Marie-Victorin, automne 2026
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
12. [Documentation Swagger](#documentation-swagger)
13. [Tests avec Postman](#tests-avec-postman)
14. [Workflow Git](#workflow-git)

---

## Fonctionnalités

- CRUD complet sur deux ressources : **places** (endroits) et **reviews** (avis)
- Ressource imbriquée : création et liste des avis sous `/places/{placeId}/reviews`
- Calcul automatique de la note moyenne (`averageRating`) et du nombre d'avis (`reviewCount`) d'un endroit
- Filtrage par catégorie et pagination sur la liste des endroits
- Validation des entrées avec `class-validator` (rejet des champs inconnus)
- Réponses d'erreur normalisées au format **Problem Details** (RFC 9457)
- Persistance dans un fichier JSON (`data/db.json`) via `node:fs/promises`
- Documentation interactive **Swagger / OpenAPI**
- Collection **Postman** fournie

## Technologies

| Outil | Rôle |
|---|---|
| [NestJS](https://docs.nestjs.com) 12 | Framework back-end |
| TypeScript | Langage |
| class-validator / class-transformer | Validation et transformation des DTO |
| @nestjs/swagger | Génération de la documentation OpenAPI |
| node:fs/promises | Persistance JSON |
| Postman | Tests manuels de l'API |
| oxlint / Prettier | Qualité et formatage du code |

## Prérequis

- [Node.js](https://nodejs.org) 20 ou plus récent
- npm
- (Optionnel) [Postman](https://www.postman.com/downloads/)

## Installation et démarrage

```bash
# 1. Cloner le dépôt
git clone https://github.com/DiegoFanara/TP1-CampusRate.git
cd TP1-CampusRate

# 2. Installer les dépendances
npm install

# 3. Lancer l'API en mode développement (rechargement automatique)
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

Un fichier `.env.example` est fourni à titre de référence.

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `3000` | Port d'écoute du serveur |

Le fichier de données `data/db.json` est **créé automatiquement** au premier démarrage avec la structure `{ "places": [], "reviews": [] }`. Il est ignoré par Git.

## Structure du projet

```
src/
├── main.ts                        # Bootstrap : préfixe global, ValidationPipe, filtre d'erreurs, Swagger
├── app.module.ts                  # Module racine
├── common/
│   └── filters/
│       └── problem-details.filter.ts   # Formatage des erreurs (RFC 9457)
├── database/
│   ├── database.module.ts
│   └── database.service.ts        # Lecture / écriture du fichier data/db.json
├── places/
│   ├── dto/                       # CreatePlaceDto, UpdatePlaceDto, QueryPlacesDto
│   ├── entities/place.entity.ts
│   ├── enums/                     # PlaceCategory, PlaceStatus
│   ├── places.controller.ts
│   ├── places.module.ts
│   └── places.service.ts
└── reviews/
    ├── dto/                       # CreateReviewDto, UpdateReviewDto
    ├── entities/review.entity.ts
    ├── reviews.controller.ts
    ├── reviews.module.ts
    └── reviews.service.ts
postman_collection.json            # Collection Postman
```

## Modèle de données

### Place

| Champ | Type | Obligatoire à la création | Description |
|---|---|---|---|
| `id` | `string` (UUID) | généré | Identifiant unique |
| `name` | `string` | oui | Nom de l'endroit |
| `description` | `string` | oui | Description |
| `category` | `PlaceCategory` | oui | Catégorie (voir ci-dessous) |
| `address` | `string` | oui | Emplacement (ex. local, pavillon) |
| `services` | `string[]` | non (défaut `[]`) | Services offerts |
| `status` | `PlaceStatus` | non (défaut `ACTIVE`) | Statut de l'endroit |
| `averageRating` | `number \| null` | calculé | Moyenne des notes, `null` s'il n'y a aucun avis |
| `reviewCount` | `number` | calculé | Nombre d'avis |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | générés | Dates de création et de modification |

**`PlaceCategory`** : `STUDY_SPACE`, `LIBRARY`, `FOOD_SERVICE`, `SPORTS`, `STUDENT_SERVICE`, `COMPUTER_LAB`, `OTHER`

**`PlaceStatus`** : `ACTIVE`, `TEMPORARILY_CLOSED`, `INACTIVE`

### Review

| Champ | Type | Obligatoire à la création | Contraintes |
|---|---|---|---|
| `id` | `string` (UUID) | généré | |
| `placeId` | `string` | tiré de l'URL | Doit référencer un endroit existant |
| `authorsName` | `string` | oui | Non vide |
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

> **Choix de conception :** la création et la liste des avis sont imbriquées sous l'endroit, car un avis n'existe pas sans lui. La consultation, la modification et la suppression d'un avis passent par `/reviews/{id}`, puisque l'identifiant de l'avis suffit à le retrouver et que répéter `placeId` serait redondant.

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
  "id": "3f1c2b8e-9d4a-4c1e-8a2f-5b6d7e8f9a01",
  "name": "Bibliothèque",
  "description": "Espace calme avec postes de travail et prêt de livres",
  "category": "LIBRARY",
  "address": "Pavillon A, local A-200",
  "services": ["Wi-Fi", "Imprimante"],
  "status": "ACTIVE",
  "averageRating": null,
  "reviewCount": 0,
  "createdAt": "2026-09-24T14:00:00.000Z",
  "updatedAt": "2026-09-24T14:00:00.000Z"
}
```

**Ajouter un avis**

```http
POST /api/v1/places/3f1c2b8e-9d4a-4c1e-8a2f-5b6d7e8f9a01/reviews
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
- `averageRating` et `reviewCount` sont **recalculés automatiquement** à chaque création, modification ou suppression d'un avis. Ils ne peuvent pas être modifiés directement.
- La suppression d'un endroit entraîne la **suppression en cascade** de tous ses avis.
- `updatedAt` est mis à jour à chaque modification.

## Validation et gestion des erreurs

Un `ValidationPipe` global est configuré avec :

- `whitelist: true` — retire les propriétés non déclarées dans le DTO ;
- `forbidNonWhitelisted: true` — rejette la requête si une propriété inconnue est envoyée ;
- `transform: true` — convertit les paramètres (ex. `page`, `limit`) vers leur type.

Toutes les erreurs passent par un filtre global (`ProblemDetailsFilter`) qui renvoie une réponse `application/problem+json` conforme à la **RFC 9457** :

```json
{
  "type": "about:blank",
  "title": "NotFound",
  "status": 404,
  "detail": "Place 1234 introuvable",
  "instance": "/api/v1/places/1234"
}
```

| Code | Cas |
|---|---|
| `400 Bad Request` | Données invalides, champ inconnu, paramètre de requête invalide |
| `404 Not Found` | Endroit ou avis introuvable |
| `500 Internal Server Error` | Erreur inattendue |

## Documentation Swagger

Une fois l'API démarrée, la documentation interactive est disponible à :

**http://localhost:3000/api/docs**

Elle est générée automatiquement à partir des contrôleurs et des DTO grâce au plugin `@nestjs/swagger` (configuré dans `nest-cli.json`).

## Tests avec Postman

1. Ouvrir Postman, puis **Import** → sélectionner `postman_collection.json`.
2. Dans les variables de la collection, régler `baseUrl` à `http://localhost:3000`.
3. Démarrer l'API (`npm run start:dev`) et exécuter les requêtes.

La collection couvre les 10 endpoints de l'API, regroupés par ressource.

## Workflow Git

Le projet suit le workflow par branches et issues vu en classe :

- une **issue parente** (#1) pour le TP, avec des sous-issues pour chaque tâche ;
- une branche par fonctionnalité (ex. `feature/4-json-persistance`, `feature/5-crud-places-reviews`) ;
- des commits qui référencent l'issue concernée (`refs #N`) ;
- une Pull Request vers `main` pour chaque fonctionnalité terminée ; les branches fusionnées sont conservées comme trace.
