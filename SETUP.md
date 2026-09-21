# SETUP — Demo Users API (Microservicios)

Java 25 | Spring Boot 4.1 | Angular 22 | Tailwind v4 | PostgreSQL 17 | NGINX | Docker

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
docker compose exec postgres-auth psql -U auth_user -d auth_db -c "SELECT username, email, role FROM users;"

# Verificar datos de users-db
docker compose exec postgres-users psql -U users_user -d users_db -c "SELECT first_name, last_name FROM user_profiles;"
```

---

## Paso 2: Levantar auth-service (cuando exista el codigo)

```powershell
cd auth-service
mvn clean package -DskipTests
mvn spring-boot:run
# Corre en :8081
```

---

## Paso 3: Levantar user-service (cuando exista el codigo)

```powershell
cd user-service
mvn clean package -DskipTests
mvn spring-boot:run
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
├── auth-service/                 ← Spring Boot (JWT REST API)
├── user-service/                 ← Spring Boot (GraphQL API)
├── frontend/                     ← Angular 22 + Tailwind v4
├── init-scripts/
│   ├── auth-db/                  ← Schema + seed para auth DB
│   └── users-db/                 ← Schema + seed para users DB
└── PLAN.md
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
