# Plan: Arquitectura de Microservicios — Demo Users API

## Estado del Proyecto

**Última actualización:** 2026-09-22

### ✅ Completado
- [x] Infraestructura (docker-compose, NGINX, scripts SQL, Dockerfiles)
- [x] Auth Service (Java 25 + Spring Boot 4.1 + JWT RS256) ✅ **COMPLETADO**
- [x] Tests unitarios e integración (AuthServiceTest + AuthControllerIntegrationTest)
- [x] Verificación con Postman (endpoints /api/auth/* funcionales)
- [x] User Service (.NET 10 + Entity Framework Core 10 + GraphQL + JWT) ✅ **COMPLETADO**
- [x] Tests unitarios (6/6 pasando con xUnit + FluentAssertions)
- [x] Sincronización Auth Service → User Service (creación automática de perfiles)
- [x] Seguridad con header secreto para comunicación interna
- [x] Documentación (QWEN.md, README.md, PLAN.md actualizados)

### ⬜ Pendiente
- [ ] Frontend Angular 22 + Tailwind v4
- [ ] Documentación final (SETUP.md completo)

---

## Arquitectura General

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

## Decisiones Técnicas

| Componente | Tecnología | Puerto |
|---|---|---|
| API Gateway | NGINX (reverse proxy) | 80 |
| Auth Service | Java 25 + Spring Boot 4.1 | 8081 |
| User Service | .NET 10 + ASP.NET Core + Entity Framework Core 10 | 8082 |
| DB Auth | PostgreSQL 17 | 5433 |
| DB Users | PostgreSQL 17 | 5434 |
| Frontend | Angular 22 + Tailwind v4 | 4200 (dev) / 80 (prod via NGINX) |
| JWT | RS256 (RSA key pair) | — |
| Build/Package | Maven (auth), dotnet CLI (user), pnpm (frontend) | — |
| Containerización | Docker + Docker Compose | — |

## Flujo JWT (mejores prácticas)

1. **Auth Service** genera un par de claves RSA (public/private) al arrancar
2. Login → Auth Service devuelve **access token** (15 min) + **refresh token** (7 días, guardado en DB)
3. NGINX forwardea el JWT en header `Authorization: Bearer <token>` a user-service
4. **User Service** valida el token usando la **clave pública** del auth service (compartida via volumen Docker)
5. Refresh endpoint rota el refresh token (one-time use)

## Estructura del Proyecto

```
demo-users-api-latest/
── docker-compose.yml          # Orquesta todos los servicios
├── nginx/
│   ── nginx.conf              # Configuración reverse proxy + routing
├── auth-service/               # Spring Boot project (Java)
│   ├── pom.xml
│   ├── Dockerfile
│   ── src/
│       ├── main/java/com/demo/authservice/
│       │   ├── config/         # SecurityConfig
│       │   ├── controller/     # AuthController
│       │   ├── model/          # User, RefreshToken, DTOs
│       │   ├── repository/     # UserRepository, RefreshTokenRepository
│       │   ├── service/        # AuthService
│       │   └── security/       # RsaKeyManager, JwtService
│       └── main/resources/
│           └── application.yaml
├── user-service/               # .NET solution (C#)
│   ├── UserApi.slnx           # Solution file
│   ├── UserApi/               # Main project (API)
│   │   ├── UserApi.csproj
│   │   ├── Dockerfile
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── Data/              # DbContext, entities
│   │   ├── GraphQL/           # Schema, resolvers
│   │   ├── Security/          # JWT validation
│   │   └── Services/          # Business logic
│   └── UserApi.Tests/         # Test project
│       ├── UserApi.Tests.csproj
│       └── UserServiceTests.cs
├── frontend/                   # Angular 22 + Tailwind v4
│   ├── package.json
│   ├── angular.json
│   ├── tailwind.config.ts
│   ├── Dockerfile
│   └── src/
├── init-scripts/
│   ├── auth-db/                # Schema + seed para auth DB
│   └── users-db/               # Schema + seed para users DB
├── keys/                       # RSA keys (generadas al arrancar, gitignored)
├── QWEN.md                     # Especificaciones del proyecto
├── SETUP.md                    # Instrucciones de instalación
└── README.md                   # Overview del proyecto
```

## Endpoints

### Auth Service (:8081) - REST
| Method | Path | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Crear cuenta |
| POST | /api/auth/login | No | Obtener access + refresh token |
| POST | /api/auth/refresh | No | Rotar refresh token |
| POST | /api/auth/logout | Sí | Invalidar refresh token |

### User Service (:8082) - GraphQL
| Operación | Tipo | Auth | Descripción |
|---|---|---|---|
| `users` | Query | Bearer | Listar usuarios (paginado) |
| `user(id)` | Query | Bearer | Obtener usuario por ID |
| `updateUser(id, input)` | Mutation | Bearer (owner) | Actualizar perfil |
| `deleteUser(id)` | Mutation | Bearer (owner/admin) | Eliminar usuario |

### NGINX routing
| Path | Target |
|---|---|
| /api/auth/* | auth-service:8081 |
| /graphql | user-service:8082 |
| /* | frontend (static build) |

## Decisiones de API

- **Auth Service** → REST (operaciones simples: login, register, refresh)
- **User Service** → GraphQL (consultas flexibles de usuarios, paginación, filtros)

## Pasos de Implementación

### Capa de Arquitectura (creado directamente)
- [x] 1. **docker-compose.yml** — 6 servicios: nginx, auth-service, user-service, postgres-auth, postgres-users, frontend
- [x] 2. **Scripts SQL** — Creación de schemas, tablas y datos de ejemplo (init-scripts/)
- [x] 3. **Estructura de carpetas** — auth-service/, user-service/, nginx/, frontend/
- [x] 4. **Dockerfiles** — Multi-stage builds para auth-service y user-service

### Capa de Aplicación (guiado paso a paso)
- [x] 5. **Configurar NGINX** — Reverse proxy con routing por path
- [x] 6. **Crear auth-service** — Spring Boot + Spring Security + JWT RS256 ✅ COMPLETADO
- [x] 7. **Crear user-service** — .NET 10 + Entity Framework Core 10 + GraphQL + validación JWT ✅ COMPLETADO
  - [x] 7.1 Proyecto creado con .NET 10 SDK
  - [x] 7.2 Paquetes NuGet instalados (Npgsql, HotChocolate, JWT Bearer)
  - [x] 7.3 EF Core scaffold desde DB PostgreSQL (entidades generadas automáticamente)
  - [x] 7.4 Connection string configurada en appsettings.json
  - [x] 7.5 JWT configurado (validación con public key del auth-service)
  - [x] 7.6 GraphQL configurado (HotChocolate con queries y mutations)
  - [x] 7.7 Sincronización Auth Service → User Service implementada
  - [x] 7.8 Seguridad con header secreto para mutation interna
  - [x] 7.9 Capa de Services creada (IUserService, UserService)
  - [x] 7.10 Tests unitarios creados (6/6 pasando)
  - [x] 7.11 Refactorizado a solución .NET con proyectos separados
- [ ] 8. **Crear frontend Angular** — Tailwind v4, consumo REST (auth) + GraphQL (users)
- [ ] 9. **Actualizar SETUP.md** — Instrucciones completas

## Verificación

1. `docker compose up --build` levanta todos los servicios
2. Registrar usuario via `curl POST /api/auth/register`
3. Login via `curl POST /api/auth/login` → obtener tokens
4. Acceder a `/graphql` con Bearer token → 200 OK
5. Acceder a `/graphql` sin token → 401 Unauthorized
6. Frontend Angular: login, ver lista de usuarios, CRUD

## Notas de Desarrollo

### Auth Service
- Generado con Spring Initializr (Spring Boot 4.1.1, Java 25)
- Dependencies: spring-boot-starter-webmvc, data-jpa, security, validation, postgresql, lombok, devtools
- JWT: jjwt 0.12.6 (api/impl/jackson)
- Tests: JUnit 5 + Mockito (unit), Testcontainers 1.21.4 + WebTestClient (integration)
- Puerto: 8081
- Schema: auth (en auth_db)

### User Service ✅ COMPLETADO
- Framework: .NET 10 (LTS, soporte hasta noviembre 2028)
- ORM: Entity Framework Core 10 (scaffold desde DB existente)
- API: GraphQL (HotChocolate 16.6.6)
- Puerto: 8082
- Schema: users (en users_db)
- JWT: Validación con public key RSA del auth-service
- Seguridad: Header secreto para comunicación interna entre servicios
- Tests: xUnit 2.9.3 + FluentAssertions 8.11.0 + EF Core InMemory (6 tests pasando)
- Estructura: Solución .NET con proyectos separados (UserApi + UserApi.Tests)
- Sincronización: Auth Service llama a User Service para crear perfiles automáticamente
