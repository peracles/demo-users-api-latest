-- =============================================
-- USERS DB - Seed data
-- Los user_ids coinciden con los del auth-db
-- =============================================

INSERT INTO users.user_profiles (user_id, first_name, last_name, phone, bio) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin',    'Root',     '+528112345678', 'System administrator'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Carlos',   'Garcia',   '+528123456789', 'Backend developer'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Maria',    'Lopez',    '+528134567890', 'Frontend developer'),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Pedro',    'Martinez', '+528145678901', 'Full stack developer');
