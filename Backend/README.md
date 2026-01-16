# SneakFit API Documentation

## Overview
The **SneakFit API** is a RESTful service for recipe management, meal planning, and algorithmic food discovery.

### API Structure
```text
├── Auth                                     #  Authorization segment
│   ├── POST    /auth/login                  ## Presentation Layer (Controllers, Middleware)
│   ├── POST    /auth/register               ## Domain Layer (Entities, Value Objects)
│   ├── POST    /auth/refresh                ## Infrastructure & Application Layer (CQRS, Auth, DB)
│   └── POST    /auth/revoke                 ## Unit & Integration Tests
├── Category                                 #  Categories segment
|   ├── POST    /category/add                ## 
|   └── DELETE  /category/delete/{id}        ## 
├── Comment                                  #  Categories segment
|   ├── POST    /comment/{dishId}/add        ## 
|   ├── PUT     /comment/{commentId}/edit    ## 
|   ├── DELETE  /comment/{commentId}/delete  ## 
|   └── GET     /comment/{dishId}/all        ## 
├── Dish                                     #  Dishes segment
|   ├── POST    /dish/add                    ##
|   ├── PUT     /dish/{dishId}/public        ##
|   ├── GET     /dish/{dishId}               ##
|   ├── PUT     /dish/{dishId}/update        ##  
|   ├── GET     /dishes                      ##
|   ├── POST    /dish/{id}/favorite          ##
|   ├── DELETE  /dish/{id}/delete            ##
|   └── GET     /dish/recommended            ##
└── User                                     #  Users segment
|   ├── PUT     /user/{id}/lang              ## Client-side application
|   └── PUT     /user/{id}/settings          ##
└────────────────────────────────────────────
```

## Base URL
All URLs referenced in the documentation have the following base:
`localhost`

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
After providing valid data, return tokens

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
<HR>

#### Register
Allow user to register account

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
