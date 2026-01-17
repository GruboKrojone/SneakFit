# SneakFit API Documentation

## 📋 Contents

- [Overview](#overview)
- [API Structure](#api-structure)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Content Negotiation](#content-negotiation)
- [Response Codes](#response-codes)
- [Endpoints](#endpoints)
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
```

**Example Response (200):**
```bash
```

---

#### Revoke
Desc sample.

**Definition:**
`POST /auth/revoke`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | string | Yes | Refresh token |

**Example Request:**
```bash
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
```

---

#### Delete
Soft delete dish category.

**Definition:**
`POST /category/{id}/delete`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | Category ID |

**Example Request:**
```bash
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
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
```

**Example Response (200):**
```bash
```