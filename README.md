# SneakFit

> **SneakFit** – an intelligent recipe recommendation system with a swipe mechanism.

## 📋 Contents

- [About](#-about)
- [Running](#-running)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Requirements](#-requirements)

---

## 🎯 About

**SneakFit** is a web application that acts as a digital cookbook and kitchen assistant in one. It allows you to store all your family recipes in one place, manage your daily meals, and discover new inspirations through an intuitive swipe interface.

### Main Functions

* 🔐 **Authentication & Authorization** – Secure access using **JWT** tokens.
* 🍽️ **Recipe Management** – Full **CRUD** operations for your dishes.
* ⭐ **Favorites** – Mark and save your most-loved recipes.
* 📂 **Categories** – Recipe categorization (Admin managed).
* 🔒 **Access Control** – Toggle between **private** and **public** visibility.
* 👥 **User Roles** – Managed permissions for **Users** and **Admins**.

---

## 🎮 Running

`Deployment link will be provided here in the future.`

---

## 🚀 Tech Stack

### Backend
* **Language/Framework:** .NET / C#
* **Database:** SQL Server (Entity Framework Core)
* **Libraries:** MediatR, FluentValidation, AutoMapper
* *More details in the* `Backend/` *directory.*

### Frontend
* **Framework:** React.js
* **Styling:** CSS Modules / Tailwind CSS
* *More details in the* `Frontend/` *directory.*

---

## 🏗️ Architecture

The project follows **Clean Architecture** principles to ensure maintainability and scalability.

### Project Structure
```text
├── Backend/
│   ├── API/             # Presentation Layer (Controllers, Middleware)
│   ├── Domain/          # Domain Layer (Entities, Value Objects)
│   ├── Core/            # Infrastructure & Application Layer (CQRS, Auth, DB)
│   └── Domain.Tests/    # Unit & Integration Tests
└── Frontend/            # Client-side application
