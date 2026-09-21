-- =============================================
-- AUTH DB - Seed data
-- Contraseñas (todas BCrypt, costo 12):
--   admin123  -> $2a$12$LJ3m4ys3Lk0TSwHjGQnJOe4hZDJG8bNqAKvqM5PkRf5H3MKv0UxWy
--   user123   -> $2a$12$K7g2Vq8GFzX1bN3rTeF5wuCpYjQaR9kZ5mK7vB8FqN3xYwZ0hJGmi
-- =============================================

INSERT INTO auth.users (id, email, username, password, role, enabled) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@demo.com',    'admin',  '$2a$12$LJ3m4ys3Lk0TSwHjGQnJOe4hZDJG8bNqAKvqM5PkRf5H3MKv0UxWy', 'ADMIN', TRUE),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'carlos@demo.com',   'carlos', '$2a$12$K7g2Vq8GFzX1bN3rTeF5wuCpYjQaR9kZ5mK7vB8FqN3xYwZ0hJGmi', 'USER',  TRUE),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'maria@demo.com',    'maria',  '$2a$12$K7g2Vq8GFzX1bN3rTeF5wuCpYjQaR9kZ5mK7vB8FqN3xYwZ0hJGmi', 'USER',  TRUE),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'pedro@demo.com',    'pedro',  '$2a$12$K7g2Vq8GFzX1bN3rTeF5wuCpYjQaR9kZ5mK7vB8FqN3xYwZ0hJGmi', 'USER',  TRUE);
