UPDATE users SET role = 'ADMIN' WHERE name = 'alice';
UPDATE users SET role = 'USER' WHERE name IN ('bob', 'carol');
