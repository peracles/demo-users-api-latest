# Demo Users API - Especificaciones del Proyecto

## Overview

Microservicios demo para práctica y presentación en entrevistas técnicas. Arquitectura moderna con API Gateway, autenticación JWT, y base de datos PostgreSQL.

## Stack Tecnológico

### Backend
| Servicio | Framework | Lenguaje | Versión |
|---|---|---|---|
| Auth Service | Spring Boot | Java | 25 |
| Auth Service | Spring Boot | - | 4.1.1 |
| User Service | ASP.NET Core | C# | .NET 10 (LTS) |
| User Service | Entity Framework Core | - | 10.x |
| User Service | HotChocolate (GraphQL) | - | 16.6.6 |

### Frontend
| Componente | Tecnología | Versión |
|---|---|---|
| Framework | Angular | 22 |
| Styling | Tailwind CSS | v4 |
| Package Manager | pnpm | 10+ |

### Infraestructura
| Componente | Tecnología | Versión |
|---|---|---|
| API Gateway | NGINX | 1.27-alpine |
| Base de Datos | PostgreSQL | 17-alpine |
| Containerización | Docker + Docker Compose | - |
| JWT | RS256 (RSA 2048-bit) | - |

## Arquitectura

```
┌─────────────┐     ┌─────────────
│   Angular    │────▶│    NGINX     │
│  (Tailwind)  │     │  (Gateway)   │
│  :4200/:80   │     │    :80       │
└─────────────┘     └──────┬──────
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌────────────────
     │  auth-service   │       │  user-service   │
     │   :8081         │       │   :8082         │
     │  (Java/Spring)  │       │  (.NET/GraphQL) │
     └───────┬─────────       └───────┬─────────
             │                         │
     ┌───────▼─────────┐       ┌───────▼─────────┐
     │  postgres-auth   │       │  postgres-users  │
     │  :5433           │       │  :5434           │
     └─────────────────┘       └─────────────────┘
```

## Microservicios

### Auth Service (Java/Spring Boot)

**Propósito:** Autenticación y generación de tokens JWT

**Endpoints (REST):**
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Obtener tokens
- `POST /api/auth/refresh` - Rotar refresh token
- `POST /api/auth/logout` - Invalidar refresh token

**Características:**
- JWT con RS256 (firma asimétrica RSA)
- BCrypt para hashing de passwords (cost factor 12)
- Refresh token rotation (one-time use)
- Access token: 15 minutos de expiración
- Refresh token: 7 días de expiración

**Estructura:**
```
auth-service/
├── config/         # SecurityConfig
├── controller/     # AuthController
├── model/          # User, RefreshToken, DTOs
├── repository/     # Spring Data JPA repositories
├── service/        # AuthService (business logic)
── security/       # RsaKeyManager, JwtService
```

**Tests:**
- Unitarios: JUnit 5 + Mockito (4 tests)
- Integración: Testcontainers 1.21.4 + WebTestClient (2 tests)

### User Service (.NET/ASP.NET Core)

**Propósito:** Gestión de perfiles de usuario con GraphQL

**Endpoints (GraphQL):**
- `query users` - Listar usuarios (paginado)
- `query user(id)` - Obtener usuario por ID
- `mutation updateUser(id, input)` - Actualizar perfil
- `mutation deleteUser(id)` - Eliminar usuario

**Características:**
- Entity Framework Core 10 para ORM
- HotChocolate para GraphQL
- Validación de JWT con clave pública del auth-service
- Database-per-service pattern

**Estructura (implementada):**
```
user-service/
├── UserApi.slnx              # Solution file
├── UserApi/                  # Main project
│   ├── Data/                 # DbContext, entities
│   ├── GraphQL/              # Schema, resolvers, types
│   ├── Security/             # JWT validation
│   ├── Services/             # Business logic (IUserService, UserService)
│   ├── Program.cs            # Entry point, DI configuration
│   ├── appsettings.json      # Configuration
│   └── Dockerfile            # Container build
└── UserApi.Tests/            # Test project
    ├── UserServiceTests.cs   # Unit tests (6 tests)
    └── UserApi.Tests.csproj
```

## Base de Datos

### Auth DB (postgres-auth:5433)
**Schema:** `auth`

**Tablas:**
- `users` - Credenciales de usuarios (email, username, password hash, role)
- `refresh_tokens` - Refresh tokens activos (token, expires_at, user_id)

### Users DB (postgres-users:5434)
**Schema:** `users`

**Tablas:**
- `user_profiles` - Perfiles de usuario (first_name, last_name, phone, bio, avatar_url)

**Relación:** `user_profiles.user_id` → `auth.users.id` (FK lógica, no física)

## Seguridad

### JWT Flow
1. Auth Service genera par de claves RSA al arrancar
2. Claves se guardan en volumen Docker compartido (`jwt-keys`)
3. Login devuelve access token (firmado con private key) + refresh token
4. User Service valida tokens con public key (lee del volumen compartido)
5. Refresh token rotation: cada refresh invalida el token anterior

### BCrypt
- Cost factor: 12 (2^12 = 4096 iteraciones)
- Salt automático por password
- One-way function (no se puede recuperar el password original)

## API Gateway (NGINX)

**Configuración:**
- Puerto: 80 (mapeado a 8880 en host para evitar conflicto con IIS)
- Routing por path:
  - `/api/auth/*` → auth-service:8081
  - `/graphql` → user-service:8082
  - `/*` → frontend:4200

**Headers forwarded:**
- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `Authorization` (JWT token)

## Frontend (Angular)

**Características:**
- Angular 22 con standalone components
- Tailwind CSS v4 para styling
- Consumo de APIs:
  - REST para auth (login, register)
  - GraphQL para users (queries, mutations)
- Guards para rutas protegidas
- Interceptor para agregar JWT token a requests

## Docker Compose

**Servicios:**
1. `postgres-auth` - Base de datos para auth-service
2. `postgres-users` - Base de datos para user-service
3. `auth-service` - Microservicio de autenticación (Java)
4. `user-service` - Microservicio de usuarios (.NET)
5. `nginx` - API Gateway
6. `frontend` - Aplicación Angular

**Volúmenes:**
- `postgres_auth_data` - Datos persistentes de auth DB
- `postgres_users_data` - Datos persistentes de users DB
- `jwt-keys` - Claves RSA compartidas entre servicios
- `frontend_node_modules` - Node modules para desarrollo

## Comandos de Desarrollo

### Levantar todo
```powershell
docker compose up --build -d
```

### Levantar solo bases de datos
```powershell
docker compose up -d postgres-auth postgres-users
```

### Correr auth-service en desarrollo
```powershell
cd auth-service
.\mvnw.cmd spring-boot:run
```

### Correr user-service en desarrollo
```powershell
cd user-service/UserApi
dotnet run
```

### Correr frontend en desarrollo
```powershell
cd frontend
pnpm start
```

### Ver logs
```powershell
docker compose logs -f auth-service
docker compose logs -f user-service
```

### Detener todo
```powershell
docker compose down
```

### Reset completo (borra datos)
```powershell
docker compose down -v
docker compose up --build -d
```

## Datos de Demo

| Email | Password | Role |
|---|---|---|
| admin@demo.com | admin123 | ADMIN |
| carlos@demo.com | user123 | USER |
| maria@demo.com | user123 | USER |
| pedro@demo.com | user123 | USER |

## Variables de Entorno

### Auth Service
```
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-auth:5432/auth_db
SPRING_DATASOURCE_USERNAME=auth_user
SPRING_DATASOURCE_PASSWORD=auth_password
JWT_KEYS_DIR=/app/keys
```

### User Service
```
ConnectionStrings__UsersDb=Host=postgres-users;Port=5432;Database=users_db;Username=users_user;Password=users_password
JWT_KEYS_DIR=/app/keys
```

### Pruebas

### Auth Service
```powershell
# Tests unitarios
.\mvnw.cmd test -Dtest=AuthServiceTest

# Tests de integración
.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest

# Todos los tests
.\mvnw.cmd test
```

### User Service
```powershell
# Todos los tests (6 tests unitarios)
dotnet test

# Con verbose
dotnet test --verbosity normal
```

## Pruebas

### Auth Service
```powershell
# Tests unitarios
.\mvnw.cmd test -Dtest=AuthServiceTest

# Tests de integración
.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest

# Todos los tests
.\mvnw.cmd test
```

### User Service
```powershell
# Todos los tests (6 tests unitarios)
dotnet test

# Con verbose
dotnet test --verbosity normal
```

## Convenciones de Código

### Java (Auth Service)
- Package: `com.demo.authservice`
- Inyección de dependencias por constructor
- `@Transactional` en métodos de servicio que modifican datos
- DTOs separados de entities
- Exception handler global con `@RestControllerAdvice`

### C# (User Service) ✅ IMPLEMENTADO
- Namespace: `UserApi`
- Estructura: Solución .NET con proyectos separados (UserApi + UserApi.Tests)
- Inyección de dependencias por constructor
- Entity Framework Core 10 con database-first (scaffold desde DB existente)
- GraphQL con HotChocolate 16.6.6 (code-first)
- Capa de Services (IUserService, UserService) para lógica de negocio
- Validación de JWT con clave pública RSA del auth-service
- Seguridad: Header secreto para comunicación interna entre servicios
- Tests: xUnit + FluentAssertions + EF Core InMemory (6 tests pasando)

## Decisiones Arquitectónicas

### Por qué microservicios
- Separación de responsabilidades (auth vs business logic)
- Escalabilidad independiente
- Diferentes stacks tecnológicos (Java vs .NET)
- Database-per-service pattern

### Por qué JWT RS256
- Firma asimétrica (private key firma, public key valida)
- User Service no necesita access a la private key
- Si comprometen el user-service, no pueden falsificar tokens

### Por qué GraphQL en User Service
- Consultas flexibles (cliente decide qué campos necesita)
- Un solo endpoint para todas las operaciones
- Ideal para datos de usuarios con relaciones complejas

### Por qué REST en Auth Service
- Operaciones simples y bien definidas
- No necesita consultas flexibles
- Más simple de implementar y entender

## Próximos Pasos

1. ~~**User Service (.NET 10)**~~ - ✅ COMPLETADO
2. **Frontend Angular** - Crear UI con Tailwind CSS
3. ~~**Documentación**~~ - ✅ SETUP.md, README.md, QWEN.md, PLAN.md actualizados
4. **CI/CD** - Agregar GitHub Actions para build y tests
5. **Deploy** - Configurar para producción (Docker Swarm o Kubernetes)
