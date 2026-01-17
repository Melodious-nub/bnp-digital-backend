-- Reseeding with more professional data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE candidates;
TRUNCATE TABLE districts;
TRUNCATE TABLE divisions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Admin
INSERT INTO users (id, username, password_hash, role) VALUES 
(1, 'admin', '$2b$10$EwiDy5W/LBj6x/36kxPDEeFxrKN9xXyjO2EKIg1Xxy2QEToPYOdxS', 'super_admin');

-- 2. Seed Divisions (Must match Map SVG titles)
INSERT INTO divisions (id, name) VALUES 
(1, 'Dhaka'), 
(2, 'Chittagong'), 
(3, 'Sylhet'), 
(4, 'Khulna'), 
(5, 'Barishal'), 
(6, 'Rajshahi'), 
(7, 'Rangpur');

-- 3. Seed Districts
INSERT INTO districts (id, division_id, name) VALUES 
(1, 1, 'Dhaka North'), (2, 1, 'Dhaka South'), (3, 1, 'Gazipur'),
(4, 2, 'Chittagong Port'), (5, 2, 'Cox''s Bazar'),
(6, 3, 'Sylhet Sadar'), (7, 3, 'Moulvibazar'),
(8, 4, 'Khulna City'), (9, 4, 'Bagerhat'),
(10, 5, 'Barishal Sadar'), (11, 5, 'Bhola'),
(12, 6, 'Rajshahi City'), (13, 6, 'Bogra'),
(14, 7, 'Rangpur City'), (15, 7, 'Dinajpur');

-- 4. Seed Candidates
INSERT INTO candidates (user_id, full_name, slug, division_id, district_id, designation, photo_url, bio) VALUES 
(1, 'Tarique Rahman', 'tarique', 1, 1, 'Acting Chairman, BNP', 'https://api.placeholder.com/150', 'Leading the party towards a democratic future.'),
(1, 'Mirza Fakhrul', 'fakhrul', 1, 2, 'Secretary General', 'https://api.placeholder.com/150', 'Dedicated to the people of Bangladesh.'),
(1, 'Amir Khasru', 'khasru', 2, 4, 'Standing Committee Member', 'https://api.placeholder.com/150', 'Representing Chittagong Port.'),
(1, 'Ariful Haque', 'ariful', 3, 6, 'Sylhet Coordinator', 'https://api.placeholder.com/150', 'Building local leadership in Sylhet.'),
(1, 'Sheikh Mazharul', 'mazharul', 4, 8, 'Khulna Unit Chief', 'https://api.placeholder.com/150', 'Advocating for industrial growth.'),
(1, 'Sayed Mojibul', 'mojibul', 5, 10, 'Barishal Delegate', 'https://api.placeholder.com/150', 'Voice of Barishal Sadar.'),
(1, 'Khairuzzaman Zaki', 'zaki', 6, 12, 'Rajshahi Representative', 'https://api.placeholder.com/150', 'Focusing on education and agriculture.'),
(1, 'Asaduzzaman Babu', 'asad', 7, 14, 'Rangpur Lead', 'https://api.placeholder.com/150', 'Empowering grassroots workers.');
