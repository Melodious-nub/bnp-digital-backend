-- Seed Divisions
INSERT INTO divisions (name) VALUES 
('Dhaka'), ('Chittagong'), ('Rajshahi'), ('Khulna'), 
('Barisal'), ('Sylhet'), ('Rangpur'), ('Mymensingh');

-- Seed Super Admin (Password: 123456 - Hash needs replacement in production)
-- Note: You should generate a real bcrypt hash for the password
INSERT INTO users (username, password_hash, role) VALUES 
('central_admin', '$2b$10$YourHashedPasswordHere', 'super_admin');
