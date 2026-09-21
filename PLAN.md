# Plan: Arquitectura de Microservicios — Demo Users API

## Arquitectura General

```
┌─────────────┐     ┌─────────────┐
│   Angular    │────▶│    NGINX     │
│  (Tailwind)  │     │  (Gateway)   │
│  :4200/:80   │     │    :80       │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
     ┌────────────────┐       ┌────────────────┐
     │  auth-service   │       │  user-service   │
     │   :8081         │       │   :8082         │
     │  (JWT + RS256)  │       │  (CRUD users)   │
     └───────┬─────────┘       └───────┬─────────┘
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
| User Service | Java 25 + Spring Boot 4.1 | 8082 |
| DB Auth | PostgreSQL 17 | 5433 |
| DB Users | PostgreSQL 17 | 5434 |
| Frontend | Angular 22 + Tailwind v4 | 4200 (dev) / 80 (prod via NGINX) |
| JWT | RS256 (RSA key pair) | — |
| Build/Package | Maven (backend), pnpm (frontend) | — |
| Containerización | Docker + Docker Compose | — |

## Flujo JWT (mejores prácticas)

1. **Auth Service** genera un par de claves RSA (public/private) al arrancar
2. Login → Auth Service devuelve **access token** (15 min) + **refresh token** (7 días, guardado en DB)
3. NGINX forwardea el JWT en header `Authorization: Bearer <token>` a user-service
4. **User Service** valida el token usando la **clave pública** del auth service (compartida via volumen Docker o endpoint JWKS)
5. Refresh endpoint rota el refresh token (one-time use)

## Estructura del Proyecto

```
demo-users-api-latest/
├── docker-compose.yml          # Orquesta todos los servicios
├── nginx/
│   └── nginx.conf              # Configuración reverse proxy + routing
├── auth-service/               # Spring Boot project
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/demo/authservice/
│       │   ├── config/         # SecurityConfig, JwtConfig
│       │   ├── controller/     # AuthController (login, register, refresh)
│       │   ├── model/          # User entity, DTOs
│       │   ├── repository/     # UserRepository
│       │   ├── service/        # AuthService, JwtService
│       │   └── security/       # RSA key generator, JWT filter
│       └── main/resources/
│           └── application.yml
├── user-service/               # Spring Boot project
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/demo/userservice/
│       │   ├── config/         # SecurityConfig (valida JWT con public key)
│       │   ├── controller/     # UserController (CRUD)
│       │   ├── model/          # UserProfile entity, DTOs
│       │   ├── repository/     # UserProfileRepository
│       │   └── service/        # UserService
│       └── main/resources/
│           └── application.yml
├── frontend/                   # Angular 22 + Tailwind v4
│   ├── package.json
│   ├── angular.json
│   ├── tailwind.config.ts
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── core/           # Guards, interceptors, auth service
│       │   ├── shared/         # Componentes reutilizables
│       │   ├── features/       # login, register, users-list, profile
│       │   └── layout/         # Navbar, sidebar
│       └── styles.scss         # Tailwind imports
├── keys/                       # RSA keys (generadas al arrancar, gitignored)
└── SETUP.md                    # Instrucciones actualizadas
```

## Endpoints

### Auth Service (:8081)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Crear cuenta |
| POST | /api/auth/login | No | Obtener access + refresh token |
| POST | /api/auth/refresh | No | Rotar refresh token |
| POST | /api/auth/logout | Sí | Invalidar refresh token |

### User Service (:8082)
| Method | Path | Auth | Descripción |
|---|---|---|---|
| GET | /api/users | Bearer | Listar usuarios (paginado) |
| GET | /api/users/{id} | Bearer | Obtener usuario |
| PUT | /api/users/{id} | Bearer (owner) | Actualizar perfil |
| DELETE | /api/users/{id} | Bearer (owner/admin) | Eliminar usuario |

### NGINX routing
| Path | Target |
|---|---|
| /api/auth/* | auth-service:8081 |
| /api/users/* | user-service:8082 |
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
- [ ] 6. **Crear auth-service** — Spring Boot + Spring Security + JWT RS256
- [ ] 7. **Crear user-service** — Spring Boot + GraphQL + validación JWT
- [ ] 8. **Crear frontend Angular** — Tailwind v4, consumo REST (auth) + GraphQL (users)
- [ ] 9. **Actualizar SETUP.md** — Instrucciones completas

## Verificación

1. `docker compose up --build` levanta todos los servicios
2. Registrar usuario via `curl POST /api/auth/register`
3. Login via `curl POST /api/auth/login` → obtener tokens
4. Acceder a `/api/users` con Bearer token → 200 OK
5. Acceder a `/api/users` sin token → 401 Unauthorized
6. Frontend Angular: login, ver lista de usuarios, CRUD
