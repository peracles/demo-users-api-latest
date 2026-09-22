-- =============================================
-- AUTH DB - Seed data
-- Contraseñas (todas BCrypt, costo 12):
--   admin123  -> $2a$12$vWqcSIKUrws7MYGS9.5jWOgY3XhjQC6BmOKc14sKwTCAhwCzJL0am
--   user123   -> $2a$12$bnzq.snR/qLR16fkcSX6jOBgeT8TIT2wC2OnryC..P02Xryl41pJy
-- =============================================

INSERT INTO auth.users (id, email, username, password, role, enabled) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@demo.com',    'admin',  '$2a$12$vWqcSIKUrws7MYGS9.5jWOgY3XhjQC6BmOKc14sKwTCAhwCzJL0am', 'ADMIN', TRUE),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'carlos@demo.com',   'carlos', '$2a$12$bnzq.snR/qLR16fkcSX6jOBgeT8TIT2wC2OnryC..P02Xryl41pJy', 'USER',  TRUE),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'maria@demo.com',    'maria',  '$2a$12$bnzq.snR/qLR16fkcSX6jOBgeT8TIT2wC2OnryC..P02Xryl41pJy', 'USER',  TRUE),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'pedro@demo.com',    'pedro',  '$2a$12$bnzq.snR/qLR16fkcSX6jOBgeT8TIT2wC2OnryC..P02Xryl41pJy', 'USER',  TRUE);
