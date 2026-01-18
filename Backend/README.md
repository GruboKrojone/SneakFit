# SneakFit API Documentation

## 📋 Contents

- [Overview](#overview)
- [API Structure](#api-structure)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Content Negotiation](#content-negotiation)
- [Response Codes](#response-codes)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
## Overview
The **SneakFit API** is a RESTful service for recipe management, meal planning, and algorithmic food discovery.

### API Structure
The API is organized into the following resources:

```text
├── Auth                     # Authorization & Authentication
│   ├── POST   /auth/login
│   ├── POST   /auth/register
│   ├── POST   /auth/refresh
│   └── POST   /auth/revoke
├── Category                 # Recipe Categories
│   ├── POST   /category/add
│   └── DELETE /category/delete/{id}
├── Comment                  # Recipe Comments
│   ├── GET    /comment/{dishId}/all
│   ├── POST   /comment/{dishId}/add
│   ├── PUT    /comment/{commentId}/edit
│   └── DELETE /comment/{commentId}/delete
├── Dish                     # Recipes & Dishes
│   ├── GET    /dishes
│   ├── GET    /dish/{dishId}
│   ├── GET    /dish/recommended
│   ├── POST   /dish/add
│   ├── POST   /dish/{id}/favorite
│   ├── PUT    /dish/{dishId}/public
│   ├── PUT    /dish/{dishId}/update
│   └── DELETE /dish/{id}/delete
└── User                     # User Profile & Settings
    ├── PUT    /user/{id}/lang
    └── PUT    /user/{id}/settings
```

## Base URL
All URLs referenced in the documentation have the following base: https://localhost:7059

(TODO: Change to prod link)

## Authentication
This API uses **Bearer Token** authentication. You must include your API key in the `Authorization` header for all requests.

**Header:**
`Authorization: Bearer <YOUR_API_TOKEN>`

## Content Negotiation
* **Request Format:** `application/json`
* **Response Format:** `application/json`
* **Date Format:** All dates are returned in UTC, ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`).

---

## Response Codes
The API uses standard HTTP status codes to indicate the success or failure of an API request.

| Code | Status | Description |
| :--- | :--- | :--- |
| **200** | OK | The request was successful. |
| **400** | Bad Request | The request was invalid or cannot be served (e.g., missing parameters). |
| **401** | Unauthorized | Authentication failed or user does not have permissions. |
| **404** | Not Found | The requested resource could not be found. |
| **500** | Server Error | Something went wrong on the server side. |

---

# Endpoints

## 1. Authorization

#### Login
Authenticates a user and returns access tokens.

**Definition:**
`POST /auth/login`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<DOMAIN>/auth/login' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "<YOUR_EMAIL>",
  "password": "<YOUR_PASSWORD>"
}'
```

**Example Response (200):**
```bash
{
  "userId": <ID>,
  "email": "<USER_EMAIL>",
  "role": "<USER_ROLE>",
  "accessToken": "<BEARER_TOKEN>"
}
```

---

#### Register
Creates a new user account.

**Definition:**
`POST /auth/register`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |
| `name` | string | Yes | User name |
| `age` | integer | No | User age |
| `lang` | string | No | User preferred language. Allowed values: EN, PL, DE, ES. |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<DOMAIN>/auth/register' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "<YOUR_EMAIL>",
  "password": "<YOUR_PASSWORD>",
  "name": "<USER_NAME>",
  "age": "<USER_AGE>",
  "lang": "<USER_DEFAULT_LANG>"
}'
```

**Example Response (200):**
```bash
{
  "userId": <ID>,
  "email": "<USER_EMAIL>",
  "role": "<USER_ROLE>",
  "accessToken": "<BEARER_TOKEN>"
}
```

---

#### Refresh
Refreshes bearer token.

**Definition:**
`POST /auth/refresh`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | string | Yes | Refresh token |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<HOST>/auth/refresh' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "refreshToken": "<REFRESH_TOKEN>"
}'
```

**Example Response (200):**
```bash
{
  "userId": <ID>,
  "email": "<USER_EMAIL>",
  "role": "<USER_ROLE>",
  "accessToken": "<BEARER_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>"
}
```

---

#### Revoke
Revokes auth token.

**Definition:**
`POST /auth/revoke`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | string | Yes | Refresh token |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<HOST>/auth/revoke' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "refreshToken": "<REFRESH_TOKEN>"
}'
```

**Example Response (200):**
```bash
{}
```

---

## 2. Category

#### Add
Add new dish category.

**Definition:**
`POST /category/add`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Category name |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<HOST>/category/add' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "<NAME>"
}'
```

**Example Response (200):**
```bash
{}
```

---

#### Delete
Soft delete dish category.

**Definition:**
`DELETE /category/{id}/delete`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | Category ID |

**Example Request:**
```bash
curl -X 'DELETE' \
  'https://<HOST>/category/<ID>/delete' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

## 3. Comment

#### Add
Add new recipe comment.

**Definition:**
`POST /comment/{dishId}/add`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `dishId` | integer | Yes | Dish ID |
| `comment` | string | Yes | Comment content |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<HOST>/comment/<ID>/add' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '"<CONTENT>"'
```

**Example Response (200):**
```bash
{}
```

---

#### Edit
Edit recipe comment.

**Definition:**
`PUT /comment/{commentId}/edit`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `commentId` | integer | Yes | Comment ID |
| `comment` | string | Yes | Comment content |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/comment/<ID>/edit' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '"<EDITET_CONTENT>"'
```

**Example Response (200):**
```bash
{
  "content": "<EDITED_CONTENT>",
  "authorId": <USER_ID>,
  "dishId": <DISH_ID>
}
```

---

#### Delete
Soft delete recipe comment.

**Definition:**
`DELETE /comment/{commentId}/delete`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `commentId` | integer | Yes | Comment ID |

**Example Request:**
```bash
curl -X 'DELETE' \
  'https://<HOST>/comment/<ID>/delete' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

#### Get All
Get all dish comments

**Definition:**
`GET /comment/{dishId}/all`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `dishId` | integer | Yes | Comment ID |

**Example Request:**
```bash
curl -X 'GET' \
  'https://<HOST>/comment/<DISH_ID>/all' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
[
  {
    "content": "<CONTENT>",
    "authorId": <ID>,
    "dishId": <ID>
  },
  {
    "content": "<CONTENT>",
    "authorId": <ID>,
    "dishId": <ID>
  },
  {
    "content": "<CONTENT>",
    "authorId": <ID>,
    "dishId": <ID>
  }
]
```

---

## 4. Dish

#### Add
Desc sample.

**Definition:**
`POST /dish/add`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Recipe name |
| `description` | string | No | Recipe description |
| `calories` | integer | No | Recipe calories |
| `protein` | integer | No | Recipe proteins |
| `carbs` | integer | No | Recipe carbs |
| `fat` | integer | No | Recipe fat |

**Example Request:**
```bash
curl -X 'POST' \
  'https://<HOST>>/dish/add' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "<NAME>",
  "description": "<DESCRIPTION>",
  "calories": <CALORIES_NUM>,
  "protein": <PROTEINS_NUM>,
  "carbs": <CARBS_NUM>,
  "fat": <FAT_NUM>
}'
```

**Example Response (200):**
```bash
{}
```

---

#### Get dish details
Get dish details by ID.

**Definition:**
`GET /dish/{dishId}`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `dishId` | integer | Yes | Recipe ID |

**Example Request:**
```bash
curl -X 'GET' \
  'https://<HOST>/dish/<DISH_ID>' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{
  "id": <DISH_ID>,
  "name": "<DISH_NAME>",
  "description": "<DISH_DESCRIPTION>",
  "calories": <CALORIES_NUM>,
  "protein": <PROTEINS_NUM>,
  "carbs": <CARBS_NUM>,
  "fat": <FAT_NUM>,
  "isPublic": <IS_PUBLIC>,
  "rates": <RATES_NUM>,,
  "ownerId": <OWNER_ID>,
  "ingredients": <INGREDIENTS_ARRAY>,
}
```

---

#### Make Public
Make recipe public.

**Definition:**
`PUT /dish/{dishId}/public`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `dishId` | integer | Yes | Recipe ID |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/dish/<DISH_ID>/public' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

#### Update dish
Update dish details.

**Definition:**
`PUT /dish/{dishId}/update`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `dishId` | integer | Yes | Recipe ID |
| `name` | string | Yes | Updated recipe name |
| `description` | string | No | Updated dish decription |
| `calories` | integer | No | Updated recipe calories |
| `protein` | integer | No | Updated recipe proteins |
| `carbs` | integer | No | Updated recipe carbs |
| `fat` | integer | No | Updated recipe fat |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/dish/<ID>/update' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "<NAME>",
  "description": "<DESCRIPTION>",
  "calories": <CALORIES_NUM>,
  "protein": <PROTEINS_NUM>,
  "carbs": <CARBS_NUM>,
  "fat": <FAT_NUM>
}'
```

**Example Response (200):**
```bash
{
  "name": "<NAME>",
  "description": "<DESCRIPTION>",
  "calories": <CALORIES_NUM>,
  "protein": <PROTEINS_NUM>,
  "carbs": <CARBS_NUM>,
  "fat": <FAT_NUM>
}
```

---

#### Get dishes
Get all public and your private dishes.

**Definition:**
`GET /dishes`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |

**Example Request:**
```bash
curl -X 'GET' \
  'https://<HOST>/dishes' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
[
  {
    "id": <DISH_ID>,
    "name": "<NAME>",,
    "rates": <RATES_NUM>,
    "userId": <USER_ID>,
    "ownerName": "<OWNER_NAME>",
    "isPublic": <IS_PUBLIC>,
    "categories": ["<CATEGORY1>", "<CATEGORY2>"],
    "mainPictureId": <PICTURE_ID>
  },
 {
   <DISH_OBJECT>
 },
 {
   <DISH_OBJECT>
 }
]
```

---

#### Favorite dish
Make dish favorite.

**Definition:**
`PUT /dish/{id}/favorite`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | Recipe ID |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/dish/<ID>/favourite' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

#### Delete dish
Soft delete dish.

**Definition:**
`DELETE /dish/{id}/delete`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | Recipe ID |

**Example Request:**
```bash
curl -X 'DELETE' \
  'https://<HOST>/dish/<ID>/delete' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

#### Recommended dishes
Get recommended dishes.

**Definition:**
`GET /dish/recommended`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `maxResults` | integer | No | Count of recommended dishes to return |

**Example Request:**
```bash
curl -X 'GET' \
  'https://<HOST>/dish/recommended?maxResults=<MAX_RESULTS>' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
[
  {
    "id": <ID>,
    "name": "<NAME>",
    "rates": <RATES_NUM>,,
    "userId": <USER_ID>,,
    "ownerName": "<OWNER_NAME>",
    "isPublic": <IS_PUBLIC>,,
    "categories": ["<CATEGORY1>", "<CATEGORY2>"]
  },
  {
    "id": <ID>,
    "name": "<NAME>",
    "rates": <RATES_NUM>,
    "userId": <USER_ID>,
    "ownerName": "<OWNER_NAME>",
    "isPublic": <IS_PUBLIC>,
    "categories": ["<CATEGORY1>"]
  }
]
```

---

## 5. User

#### Language
Set user preferred language.

**Definition:**
`PUT /user/{id}/lang`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | User ID |
| `lang` | string | No | User preferred language |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/user/<ID>/lang?lang=<LANG>' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>'
```

**Example Response (200):**
```bash
{}
```

---

#### Settings
Update user settings.

**Definition:**
`PUT /user/{id}/settings`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | User ID |
| `name` | string | No | User name |
| `age` | integer | No | User age |

**Example Request:**
```bash
curl -X 'PUT' \
  'https://<HOST>/user/<ID>/settings' \
  -H 'accept: text/plain' \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "<NEW_NAME>",
  "age": <NEW_AGE>
}'
```

**Example Response (200):**
```bash
{}
```

# Data Models

<details>
<summary>Auth</summary>

```mermaid
classDiagram
    class LoginParams {
        +String email
        +String password
    }
    class LoginResponse {
        +Integer userId
        +String email
        +String role
        +String accessToken
        +String refreshToken
    }
    class RefreshTokenParams {
        +String refreshToken
    }
    class RegisterParams {
        +String email
        +String password
        +String name
        +Integer age
        +String lang
    }
    
```
</details>

<details>
<summary>Category</summary>

```mermaid
classDiagram
    class CategoryDTO {
        +Integer id
        +String name
    }
    class CategoryRequest {
        +String name
    }
```
</details>

<details>
<summary>Comment</summary>

```mermaid
classDiagram
    class CommentDTO {
        +String content
        +Integer authorId
        +Integer dishId
    }
```
</details>

<details>
<summary>Dish</summary>

```mermaid
classDiagram
    class DishCutDTO {
        +Integer id
        +String name
        +Double rates
        +Integer userId
        +String ownerName
        +Boolean isPublic
        +List<CategoryDTO> categories
        +Integer mainPictureId
        +Integer secondaryPictureId
        +Integer thirdPictureId
    }
    class DishDetails {
        +Integer id
        +String name
        +String description
        +Integer calories
        +Integer protein
        +Integer carbs
        +Integer fat
        +Boolean isPublic
        +Double rates
        +Integer ownerId
        +List<IngredientDTO> ingredients
    }
    class DishDTO {
        +String name
        +String description
        +Integer calories
        +Integer protein
        +Integer carbs
        +Integer fat
    }
    class DishParams {
        +String name
        +String description
        +Integer calories
        +Integer protein
        +Integer carbs
        +Integer fat
    }
```
</details>

<details>
<summary>Ingredient</summary>

```mermaid
classDiagram
    class IngredientDTO {
        +String name
        +String description
    }
```
</details>