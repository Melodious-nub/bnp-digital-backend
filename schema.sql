-- 1. Users (Auth System)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL, -- "superadmin" or "Dhaka1", "Dhaka2" etc.
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'candidate') DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locations (Static Data)
CREATE TABLE IF NOT EXISTS divisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    division_id INT,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (division_id) REFERENCES divisions(id)
);

CREATE TABLE IF NOT EXISTS constituencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT,
    constituency_no INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 3. Candidates (Public Profile & Subdomain Logic)
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    slug VARCHAR(100) UNIQUE NOT NULL, -- Subdomain name (e.g., dhaka1)
    full_name_en VARCHAR(255) NOT NULL,
    full_name_bn VARCHAR(255) NOT NULL,
    division_id INT,
    district_id INT,
    constituency_no INT,
    photo_url VARCHAR(255),
    designation VARCHAR(255) DEFAULT 'Member, BNP',
    brief_intro TEXT, -- Brief_Intro
    intro_bn TEXT, -- প্রারম্ভ
    political_journey TEXT, -- Political_Journey
    political_journey_bn TEXT, -- রাজনৈতিক_যাত্রা
    personal_profile TEXT, -- Personal_Profile
    personal_profile_bn TEXT, -- ব্যাক্তিগত_জীবন
    vision TEXT, -- Vision
    vision_bn TEXT, -- এলাকা_নিয়ে_তার_স্বপ্ন
    facebook_link VARCHAR(255),
    responsible_person VARCHAR(255),
    email VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (division_id) REFERENCES divisions(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 4. Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    photo_url VARCHAR(255),
    facebook_link VARCHAR(255),
    linkedin_link VARCHAR(255),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 5. Media Gallery
CREATE TABLE IF NOT EXISTS media_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT,
    file_url VARCHAR(255) NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 6. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (candidate_slug),
    INDEX idx_status (status)
);
