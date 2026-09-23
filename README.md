# Demo Users API - Microservicios con Docker

![Status](https://img.shields.io/badge/status-complete-success.svg)
![Auth Service](https://img.shields.io/badge/Auth%20Service-✅%20Complete-blue)
![User Service](https://img.shields.io/badge/User%20Service-✅%20Complete-blue)
![Frontend](https://img.shields.io/badge/Frontend-✅%20Complete-blue)

Aplicación de demostración con arquitectura de microservicios para práctica y entrevistas técnicas.

## Estado del Proyecto

| Componente | Estado | Tecnología |
|---|---|---|
| **Auth Service** | ✅ Completo | Java 25 + Spring Boot 4.1 + JWT RS256 |
| **User Service** | ✅ Completo | .NET 10 + EF Core 10 + GraphQL |
| **Frontend** | ✅ Completo | Angular 22 + Tailwind CSS v4 + shadcn UI |
| **Infrastructure** | ✅ Completo | Docker + NGINX + PostgreSQL 17 |

## Stack Tecnológico

- **Auth Service:** Java 25 + Spring Boot 4.1 + JWT RS256
- **User Service:** .NET 10 + Entity Framework Core 10 + GraphQL (HotChocolate)
- **Frontend:** Angular 22 + Tailwind CSS v4 + Componentes shadcn-style
- **API Gateway:** NGINX 1.27
- **Base de Datos:** PostgreSQL 17 (database-per-service)
- **Containerización:** Docker + Docker Compose

## Frontend - Componentes UI

El frontend incluye una librería de componentes reutilizables inspirados en shadcn/ui:

| Componente | Selector | Descripción |
|---|---|---|
| **Button** | `<ui-button>` | 6 variantes (default, destructive, outline, secondary, ghost, link), 4 tamaños |
| **Input** | `<ui-input>` | Input con ControlValueAccessor para reactive forms |
| **Textarea** | `<ui-textarea>` | Textarea con ControlValueAccessor |
| **Label** | `<ui-label>` | Label estilizado para formularios |
| **Card** | `<ui-card>` | Card con Header, Title, Description, Content, Footer |
| **Dialog** | `<ui-dialog>` | Modal con backdrop y animación |
| **Avatar** | `<ui-avatar>` | Avatar circular con iniciales (3 tamaños) |
| **Badge** | `<ui-badge>` | Badge para roles/status (4 variantes) |
| **Alert** | `<ui-alert>` | Alertas (default, destructive) |

### Funcionalidades del Frontend

- **Login/Register** con validación de formularios y manejo de errores
- **Dashboard** con lista de usuarios en grid responsivo
- **Edición de perfil** con modal y validación
- **Eliminación de usuarios** con confirmación
- **Guards de autenticación** para rutas protegidas
- **Interceptor HTTP** para JWT token y refresh automático
- **Permisos** basados en rol (ADMIN) o ownership

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

## Requisitos para Correr el Proyecto

### Opción 1: Solo Docker (Recomendado - Todo incluido)

Solo necesitas Docker Desktop instalado. Todo lo demás corre dentro de contenedores.

- **Docker Desktop** 24+ (Windows/Mac/Linux)
- **Docker Compose** v2+ (incluido en Docker Desktop)

### Opción 2: Desarrollo Local (Sin Docker)

Si quieres correr los servicios individualmente para desarrollo:

| Servicio | Requisitos |
|---|---|
| **Auth Service** | Java 25 (Oracle JDK o OpenJDK) + Maven 3.9+ |
| **User Service** | .NET 10 SDK |
| **Frontend** | Node.js 22+ + npm 10+ |
| **Bases de Datos** | PostgreSQL 17 (o usar Docker solo para las DBs) |

### Versiones Confirmadas

| Herramienta | Versión | Notas |
|---|---|---|
| Docker Desktop | 29+ | Windows/Mac/Linux |
| Java | 25 | Oracle JDK o OpenJDK |
| .NET SDK | 10.0.401 | LTS hasta Nov 2028 |
| Node.js | 22 | Para el frontend |
| PostgreSQL | 17 | Via Docker o local |

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

| Servicio | URL | Descripción |
|---|---|---|
| **Frontend** | http://localhost:4200 | Aplicación Angular (acceso directo) |
| **API Gateway** | http://localhost:8880 | NGINX proxy (rutea a todos los servicios) |
| **Auth API** | http://localhost:8880/api/auth/* | Endpoints de autenticación |
| **GraphQL** | http://localhost:8880/graphql | API de usuarios |
| **Auth Service** | http://localhost:8081 | Microservicio Java (desarrollo) |
| **User Service** | http://localhost:8082 | Microservicio .NET (desarrollo) |

**Flujo recomendado:**
1. Abre http://localhost:4200 para usar la aplicación
2. Login con `admin@demo.com` / `admin123` para acceso completo
3. O usa http://localhost:8880 para pasar por el API Gateway

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
npm install
npm start
```

El comando `npm start` automaticamente:
1. Genera el CSS de Tailwind (`npm run tailwind`)
2. Inicia el servidor de desarrollo de Angular

Accede en: http://localhost:4200

**Nota:** El proyecto usa `@tailwindcss/cli` para generar el CSS antes del build. Los scripts `prebuild` y `prestart` en `package.json` ejecutan esto automaticamente.

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
│   ├── src/app/
│   │   ├── components/        # Login, Register, Dashboard
│   │   ├── shared/ui/         # Componentes shadcn-style
│   │   ├── services/          # AuthService, UserService
│   │   ├── guards/            # Auth guard
│   │   └── interceptors/      # JWT interceptor
│   ├── tailwind.input.css     # Entry point para Tailwind CLI
│   └── package.json           # Scripts con prebuild/prestart
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

## Características de Seguridad

- **JWT RS256** - Firma asimétrica con RSA 2048-bit
- **Refresh Token Rotation** - One-time use, invalida el token anterior
- **BCrypt** - Hashing de passwords con cost factor 12
- **Database-per-service** - Cada microservicio tiene su propia base de datos
- **API Gateway** - NGINX como punto único de entrada
- **Authorization** - Permisos basados en rol (ADMIN) o ownership

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
