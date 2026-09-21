-- =============================================
-- USERS DB - Schema creation
-- =============================================

CREATE SCHEMA IF NOT EXISTS users;

-- Tabla de perfiles de usuario (datos de negocio)
CREATE TABLE IF NOT EXISTS users.user_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL UNIQUE,  -- FK logica hacia auth-db users.id
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(20),
    avatar_url  VARCHAR(500),
    bio         TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON users.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_name ON users.user_profiles(last_name);
