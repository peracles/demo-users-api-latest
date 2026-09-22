# Demo Users API - Microservicios con Docker

![Status](https://img.shields.io/badge/status-active-success.svg)
![Auth Service](https://img.shields.io/badge/Auth%20Service-✅%20Complete-blue)
![User Service](https://img.shields.io/badge/User%20Service-✅%20Complete-blue)
![Frontend](https://img.shields.io/badge/Frontend-%F0%9F%9A%A7%20Pending-orange)

Aplicación de demostración con arquitectura de microservicios para práctica y entrevistas técnicas.

## Estado del Proyecto

| Componente | Estado | Tecnología |
|---|---|---|
| **Auth Service** | ✅ Completo | Java 25 + Spring Boot 4.1 + JWT RS256 |
| **User Service** | ✅ Completo | .NET 10 + EF Core 10 + GraphQL |
| **Frontend** | 🚧 Pendiente | Angular 22 + Tailwind CSS v4 |
| **Infrastructure** | ✅ Completo | Docker + NGINX + PostgreSQL 17 |

## Stack Tecnológico

- **Auth Service:** Java 25 + Spring Boot 4.1 + JWT RS256
- **User Service:** .NET 10 + Entity Framework Core 10 + GraphQL
- **Frontend:** Angular 22 + Tailwind CSS v4
- **API Gateway:** NGINX
- **Base de Datos:** PostgreSQL 17
- **Containerización:** Docker + Docker Compose

## Arquitectura

```
┌─────────────┐     ┌─────────────
│   Angular    │────▶│    NGINX     │
│  (Tailwind)  │     │  (Gateway)   │
│  :4200/:80   │     │    :80       │
└─────────────┘     └──────┬──────
                           │
              ────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ────────────────
     │  auth-service   │       │  user-service   │
     │   :8081         │       │   :8082         │
     │  (Java/Spring)  │       │  (.NET/GraphQL) │
     └───────┬─────────       ───────┬─────────
             │                         │
     ┌───────▼─────────       ┌───────▼─────────┐
     │  postgres-auth   │       │  postgres-users  │
     │  :5433           │       │  :5434           │
     └─────────────────┘       └─────────────────┘
```

## Requisitos

- Docker Desktop 29+ (Windows/Mac/Linux)
- Docker Compose v5+
- (Opcional) Java 25 + Maven 3.9+ para desarrollo local del auth-service
- (Opcional) .NET 10 SDK para desarrollo local del user-service
- (Opcional) Node.js 20+ + pnpm 10+ para desarrollo del frontend

## Instalación Rápida con Docker

### 1. Clonar el repositorio

```powershell
git clone <repository-url>
cd demo-users-api-latest
```

### 2. Levantar todos los servicios

```powershell
docker compose up --build -d
```

Este comando:
- Construye las imágenes de auth-service, user-service y frontend
- Levanta 6 contenedores: 2 PostgreSQL, 2 microservicios, NGINX, frontend
- Crea volúmenes persistentes para las bases de datos y claves JWT

### 3. Verificar que todo está corriendo

```powershell
docker compose ps
```

Deberías ver:
```
NAME                    STATUS
demo-postgres-auth      Up (healthy)
demo-postgres-users     Up (healthy)
demo-auth-service       Up
demo-user-service       Up
demo-nginx-gateway      Up
demo-frontend           Up
```

### 4. Acceder a la aplicación

- **Frontend:** http://localhost:8880 (o el puerto que hayas configurado en nginx)
- **Auth API:** http://localhost:8880/api/auth/*
- **GraphQL:** http://localhost:8880/graphql

### 5. Ver logs

```powershell
# Todos los servicios
docker compose logs -f

# Un servicio específico
docker compose logs -f auth-service
docker compose logs -f user-service
```

## Comandos de Docker

### Levantar solo las bases de datos

```powershell
docker compose up -d postgres-auth postgres-users
```

### Detener todos los servicios

```powershell
docker compose down
```

### Reset completo (borra datos de las bases de datos)

```powershell
docker compose down -v
docker compose up --build -d
```

### Reconstruir un servicio específico

```powershell
docker compose up --build -d auth-service
```

## Desarrollo Local (sin Docker)

### Auth Service (Java)

```powershell
cd auth-service
.\mvnw.cmd spring-boot:run
```

Accede en: http://localhost:8081

### User Service (.NET)

```powershell
cd user-service/UserApi
dotnet run
```

Accede en: http://localhost:8082

### Frontend (Angular)

```powershell
cd frontend
pnpm install
pnpm start
```

Accede en: http://localhost:4200

## Pruebas Automatizadas

### Auth Service (Java)

```powershell
cd auth-service

# Todos los tests
.\mvnw.cmd test

# Solo tests unitarios
.\mvnw.cmd test -Dtest=AuthServiceTest

# Solo tests de integración
.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest
```

**Cobertura:**
- ✅ 4 tests unitarios (registro, login, tokens)
- ✅ 2 tests de integración (flujo completo con DB real)

### User Service (.NET)

```powershell
cd user-service

# Correr todas las pruebas
dotnet test

# Con verbose
dotnet test --verbosity normal
```

**Cobertura:**
- ✅ 6 tests unitarios (CRUD, autorización owner/admin)
- Framework: xUnit + FluentAssertions + EF Core InMemory

---

## Pruebas con Postman

### 1. Registrar usuario

```
POST http://localhost:8880/api/auth/register
Content-Type: application/json

{
    "email": "test@demo.com",
    "username": "testuser",
    "password": "password123"
}
```

### 2. Login

```
POST http://localhost:8880/api/auth/login
Content-Type: application/json

{
    "email": "test@demo.com",
    "password": "password123"
}
```

### 3. Usar el token en GraphQL

```
POST http://localhost:8880/graphql
Content-Type: application/json
Authorization: Bearer <access_token>

{
    "query": "{ users { id firstName lastName } }"
}
```

## Datos de Demo

| Email | Password | Role |
|---|---|---|
| admin@demo.com | admin123 | ADMIN |
| carlos@demo.com | user123 | USER |
| maria@demo.com | user123 | USER |
| pedro@demo.com | user123 | USER |

## Estructura del Proyecto

```
demo-users-api-latest/
├── docker-compose.yml          # Orquestación de servicios
├── nginx/
│   └── nginx.conf              # Configuración del API Gateway
├── auth-service/               # Microservicio de autenticación (Java)
├── user-service/               # Microservicio de usuarios (.NET)
│   ├── UserApi.slnx           # Solución .NET
│   ├── UserApi/               # API principal
│   └── UserApi.Tests/         # Pruebas unitarias
├── frontend/                   # Aplicación Angular
├── init-scripts/
│   ├── auth-db/                # Scripts de inicialización para auth DB
│   └── users-db/               # Scripts de inicialización para users DB
├── QWEN.md                     # Especificaciones técnicas del proyecto
├── PLAN.md                     # Plan de implementación y estado actual
└── SETUP.md                    # Instrucciones detalladas de instalación
```

## Documentación Adicional

- **QWEN.md** - Especificaciones técnicas completas del proyecto
- **PLAN.md** - Plan de implementación y estado actual de cada componente
- **SETUP.md** - Instrucciones paso a paso para instalación y configuración

## Troubleshooting

### Puerto 80 ocupado (IIS en Windows)

El nginx está configurado en el puerto 8880 para evitar conflicto con IIS. Si necesitas cambiarlo:

```yaml
# docker-compose.yml
nginx:
  ports:
    - "80:80"  # Cambia 8880 a 80
```

### Puerto 5433 o 5434 ocupado

```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr :5433
netstat -ano | findstr :5434

# Cambiar el puerto en docker-compose.yml
postgres-auth:
  ports:
    - "5435:5432"  # Cambia 5433 a 5435
```

### Auth-service no arranca

```powershell
# Ver logs
docker compose logs auth-service

# Reconstruir
docker compose up --build -d auth-service
```

### Bases de datos no se inicializan

```powershell
# Verificar que los scripts existen
dir init-scripts\auth-db
dir init-scripts\users-db

# Resetear volúmenes
docker compose down -v
docker compose up -d
```

## Licencia

MIT
