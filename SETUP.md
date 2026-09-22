# SETUP — Demo Users API (Microservicios)

Java 25 | Spring Boot 4.1 | .NET 10 | Entity Framework Core 10 | Angular 22 | Tailwind v4 | PostgreSQL 17 | NGINX | Docker

---

## Arquitectura

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
     │   :8081 (REST)  │       │  :8082 (GraphQL)│
     └───────┬─────────┘       └───────┬─────────┘
             │                         │
     ┌───────▼─────────┐       ┌───────▼─────────┐
     │  postgres-auth   │       │  postgres-users  │
     │  :5433           │       │  :5434           │
     └─────────────────┘       └─────────────────┘
```

---

## Prerrequisitos

| Herramienta | Versión | Verificar |
|---|---|---|
| Docker + Compose | 29+ / v5+ | `docker -v && docker compose version` |
| Java JDK | 25 | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| .NET SDK | 10 (LTS) | `dotnet --version` |
| Node.js | 20+ | `node -v` |
| pnpm | 10+ | `pnpm -v` |
| Angular CLI | 22 | `ng version` |

---

## Paso 1: Levantar solo las bases de datos

```powershell
# Levantar ambos PostgreSQL
docker compose up -d postgres-auth postgres-users

# Verificar que estan corriendo
docker compose ps

# Verificar datos de auth-db
docker compose exec postgres-auth psql -U auth_user -d auth_db -c "SELECT username, email, role FROM auth.users;"

# Verificar datos de users-db
docker compose exec postgres-users psql -U users_user -d users_db -c "SELECT first_name, last_name FROM users.user_profiles;"
```

---

## Paso 2: Levantar auth-service

```powershell
cd auth-service
mvn clean package -DskipTests
mvn spring-boot:run
# Corre en :8081
```

---

## Paso 3: Levantar user-service

```powershell
cd user-service/UserApi
dotnet restore
dotnet run
# Corre en :8082
```

---

## Paso 4: Levantar NGINX gateway

```powershell
# Desde la raiz del proyecto (requiere auth-service y user-service corriendo)
docker compose up -d nginx
# Gateway en :80
```

---

## Paso 5: Levantar frontend

```powershell
cd frontend
pnpm install
pnpm start
# Corre en :4200
```

---

## Paso 6: Levantar TODO con Docker Compose

```powershell
# Construir y levantar todos los servicios
docker compose up --build -d

# Ver estado
docker compose ps

# Ver logs de un servicio
docker compose logs -f auth-service

# Detener todo
docker compose down

# Reset completo (borra datos de las DBs)
docker compose down -v && docker compose up --build -d
```

---

## Datos de demo

| Email | Password | Role |
|---|---|---|
| admin@demo.com | admin123 | ADMIN |
| carlos@demo.com | user123 | USER |
| maria@demo.com | user123 | USER |
| pedro@demo.com | user123 | USER |

---

## Estructura del proyecto

```
demo-users-api-latest/
├── docker-compose.yml
├── nginx/nginx.conf              ← API Gateway config
├── auth-service/                 ← Spring Boot (JWT REST API) - Java
├── user-service/                 ← .NET solution
│   ├── UserApi.slnx             ← Solution file
│   ├── UserApi/                 ← ASP.NET Core (GraphQL API) - .NET 10
│   └── UserApi.Tests/           ← xUnit tests
├── frontend/                     ← Angular 22 + Tailwind v4
├── init-scripts/
│   ├── auth-db/                  ← Schema + seed para auth DB
│   └── users-db/                 ← Schema + seed para users DB
├── QWEN.md                       ← Especificaciones técnicas
├── README.md                     ← Overview e instalación
└── PLAN.md                       ← Plan de implementación
```

---

## Troubleshooting

### Puerto ocupado
```powershell
netstat -ano | findstr :5433   # postgres-auth
netstat -ano | findstr :5434   # postgres-users
netstat -ano | findstr :8081   # auth-service
netstat -ano | findstr :8082   # user-service
netstat -ano | findstr :80     # nginx
```

### Ver logs de un contenedor
```powershell
docker compose logs -f postgres-auth
docker compose logs -f auth-service
```

### Conectarse a las DBs manualmente
```powershell
# Auth DB
docker compose exec postgres-auth psql -U auth_user -d auth_db

# Users DB
docker compose exec postgres-users psql -U users_user -d users_db
```

---

## Pruebas

### Auth Service (Java)
```powershell
cd auth-service

# Tests unitarios
.\mvnw.cmd test -Dtest=AuthServiceTest

# Tests de integración
.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest

# Todos los tests
.\mvnw.cmd test
```

### User Service (.NET)
```powershell
cd user-service

# Correr todas las pruebas
dotnet test

# Correr con verbose
dotnet test --verbosity normal

# Correr solo un test específico
dotnet test --filter "FullyQualifiedName~GetAllUsersAsync_ShouldReturnAllUsers"
```

---

## Verificación manual

### 1. Registrar usuario (sincronización entre servicios)
```powershell
curl -X POST http://localhost:8081/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"test@demo.com\",\"username\":\"testuser\",\"password\":\"test123\"}"
```

**Esto debería:**
- Crear usuario en `auth_db.users`
- Llamar a User Service para crear perfil en `users_db.user_profiles`
- Retornar access token + refresh token

### 2. Verificar que el perfil se creó en Users DB
```powershell
docker compose exec postgres-users psql -U users_user -d users_db -c "SELECT user_id, first_name, last_name FROM users.user_profiles WHERE first_name = 'testuser';"
```

### 3. Login y obtener JWT
```powershell
curl -X POST http://localhost:8081/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@demo.com\",\"password\":\"admin123\"}"
```
*Copia el `accessToken` de la respuesta*

### 4. Probar GraphQL con JWT
```powershell
# Reemplaza <TOKEN> con el accessToken del paso anterior
curl -X POST http://localhost:8082/graphql `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d "{\"query\":\"query { users { firstName lastName phone bio } }\"}"
```

### 5. Probar GraphQL sin JWT (debe fallar)
```powershell
curl -X POST http://localhost:8082/graphql `
  -H "Content-Type: application/json" `
  -d "{\"query\":\"query { users { firstName lastName } }\"}"
```
*Debe retornar error de autorización*

### 6. GraphQL Playground (opcional)
Abre en el browser: `http://localhost:8082/graphql`

Agrega el header en la pestaña "Headers":
```json
{
  "Authorization": "Bearer <TU-TOKEN>"
}
```

Ejecuta queries:
```graphql
query {
  users {
    firstName
    lastName
    phone
    bio
  }
}
```
