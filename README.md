# SneakFit

> "SneakFit" - intelligent recipes recommendation swipe system

## 📋 Contents

- [About](#about)
- [Running](#running)
- [Tech](#tech)
- [Architecture](#architecture)
- [Requirements](#requirements)

## 🎯 About

"SneakFit" - Web application which works like cooking book and kitchen assistant in one. Now you can storage all of your grandmother's recipes in one place and share (or not) with others.

### Main Functions

- 🔐 **Authentication && authorization** - JWT token
- 🍽️ **Recipes management** - dish CRUD
- ⭐ **Loved dishes** - mark dish as loved
- 📂 **Categories** - recipes categorization (Admin)
- 🔒 **Access control** - private and public dishes
- 👥 **User roles** - User && Admin

## 🎮 Running
`here will be paste our link in the future`

## 🚀 Tech

### Backend

- **.NET 8** - main framework
- **C# 12.0** - programming lang
- **Entity Framework Core** - ORM
- **MediatR** - CQRS implementation
- **Autofac** - DI
- **JWT** - authentication
- **Serilog** - logging
- **FluentAssertions** - unit tests
- **Moq** - mock in tests

### Frontend

- Actually information about in `Frontend/`

## 🏗️ Architecture

**Clean Architecture** application layers :

Backend/
    API/                # Presentation layer (Controllers, Middleware)
    Domain/             # Domain layer (Entities, Commands, Queries)
    Core/               # Infrastructure layer (Database, CQRS, Auth)
    Domain.Tests/       # Unit tests
Frontend/
    /
    /
    /

### Design patterns

- **CQRS** (Command Query Responsibility Segregation)
- **Mediator Pattern** (MediatR)
- **Repository Pattern**
- **Unit of Work**
- **Dependency Injection**

## 📦 Requirements

- no needed :D