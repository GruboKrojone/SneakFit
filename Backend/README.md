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

## Endpoints

### 1. Authorization

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

**Example Response:**
**200**
```bash
{
  "userId": <ID>,
  "email": "<USER_EMAIL>",
  "role": "<USER_ROLE>",
  "accessToken": "<BEARER_TOKEN>"
}
```

#### Refresh
Refreshes bearer token.

**Definition:**
`POST /auth/refresh`

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | string | Yes | Refresh token |

**Example Response:**
**200**
```bash
```
