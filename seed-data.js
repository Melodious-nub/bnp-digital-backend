const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFile = path.join(__dirname, 'seed-log.txt');
function log(msg) {
    const timestampedMsg = `[${new Date().toISOString()}] ${msg}`;
    console.log(timestampedMsg);
    try {
        fs.appendFileSync(logFile, timestampedMsg + '\n');
    } catch (e) { }
}

const DIVISIONS = [
    { id: 1, name: 'Dhaka', bn_name: 'ঢাকা' },
    { id: 2, name: 'Chattogram', bn_name: 'চট্টগ্রাম' },
    { id: 3, name: 'Sylhet', bn_name: 'সিলেট' },
    { id: 4, name: 'Khulna', bn_name: 'খুলনা' },
    { id: 5, name: 'Barishal', bn_name: 'বরিশাল' },
    { id: 6, name: 'Rajshahi', bn_name: 'রাজশাহী' },
    { id: 7, name: 'Rangpur', bn_name: 'রংপুর' },
    { id: 8, name: 'Mymensingh', bn_name: 'ময়মনসিংহ' }
];

const DISTRICTS = [
    { id: 1, division_id: 1, name: 'Dhaka', bn_name: 'ঢাকা' },
    { id: 2, division_id: 1, name: 'Gazipur', bn_name: 'গাজীপুর' },
    { id: 3, division_id: 1, name: 'Manikganj', bn_name: 'মানিকগঞ্জ' },
    { id: 4, division_id: 1, name: 'Munshiganj', bn_name: 'মুন্সীগঞ্জ' },
    { id: 5, division_id: 1, name: 'Narayanganj', bn_name: 'নারায়ণগঞ্জ' },
    { id: 6, division_id: 1, name: 'Narsingdi', bn_name: 'নরসিংদী' },
    { id: 7, division_id: 1, name: 'Faridpur', bn_name: 'ফরিদপুর' },
    { id: 8, division_id: 1, name: 'Gopalganj', bn_name: 'গোপালগঞ্জ' },
    { id: 9, division_id: 1, name: 'Madaripur', bn_name: 'মাদারীপুর' },
    { id: 10, division_id: 1, name: 'Rajbari', bn_name: 'রাজবাড়ী' },
    { id: 11, division_id: 1, name: 'Shariatpur', bn_name: 'শরীয়তপুর' },
    { id: 12, division_id: 1, name: 'Kishoreganj', bn_name: 'কিশোরগঞ্জ' },
    { id: 13, division_id: 1, name: 'Tangail', bn_name: 'টাঙ্গাইল' },
    { id: 14, division_id: 8, name: 'Mymensingh', bn_name: 'ময়মনসিংহ' },
    { id: 15, division_id: 8, name: 'Jamalpur', bn_name: 'জামালপুর' },
    { id: 16, division_id: 8, name: 'Netrokona', bn_name: 'নেত্রকোণা' },
    { id: 17, division_id: 8, name: 'Sherpur', bn_name: 'শেরপুর' },
    { id: 18, division_id: 2, name: 'Chattogram', bn_name: 'চট্টগ্রাম' },
    { id: 19, division_id: 2, name: 'Cox\'s Bazar', bn_name: 'কক্সবাজার' },
    { id: 20, division_id: 2, name: 'Rangamati', bn_name: 'রাঙ্গামাটি' },
    { id: 21, division_id: 2, name: 'Bandarban', bn_name: 'বান্দরবান' },
    { id: 22, division_id: 2, name: 'Khagrachari', bn_name: 'খাগড়াছড়ি' },
    { id: 23, division_id: 2, name: 'Noakhali', bn_name: 'নোয়াখালী' },
    { id: 24, division_id: 2, name: 'Feni', bn_name: 'ফেনী' },
    { id: 25, division_id: 2, name: 'Lakshmipur', bn_name: 'লক্ষ্মীপুর' },
    { id: 26, division_id: 2, name: 'Cumilla', bn_name: 'কুমিল্লা' },
    { id: 27, division_id: 2, name: 'Chandpur', bn_name: 'চাঁদপুর' },
    { id: 28, division_id: 2, name: 'Brahmanbaria', bn_name: 'ব্রাহ্মণবাড়িয়া' },
    { id: 29, division_id: 3, name: 'Sylhet', bn_name: 'সিলেট' },
    { id: 30, division_id: 3, name: 'Moulivibazar', bn_name: 'মৌলভীবাজার' },
    { id: 31, division_id: 3, name: 'Habiganj', bn_name: 'হবিগঞ্জ' },
    { id: 32, division_id: 3, name: 'Sunamganj', bn_name: 'সুনামগঞ্জ' },
    { id: 33, division_id: 4, name: 'Khulna', bn_name: 'খুলনা' },
    { id: 34, division_id: 4, name: 'Bagerhat', bn_name: 'বাগেরহাট' },
    { id: 35, division_id: 4, name: 'Satkhira', bn_name: 'সাতক্ষীরা' },
    { id: 36, division_id: 4, name: 'Jashore', bn_name: 'যশোর' },
    { id: 37, division_id: 4, name: 'Magura', bn_name: 'মাগুরা' },
    { id: 38, division_id: 4, name: 'Narail', bn_name: 'নড়াইল' },
    { id: 39, division_id: 4, name: 'Kushtia', bn_name: 'কুষ্টিয়া' },
    { id: 40, division_id: 4, name: 'Jhenaidah', bn_name: 'ঝিনাইদহ' },
    { id: 41, division_id: 4, name: 'Chuadanga', bn_name: 'চুয়াডাঙ্গা' },
    { id: 42, division_id: 4, name: 'Meherpur', bn_name: 'মেহেরপুর' },
    { id: 43, division_id: 5, name: 'Barishal', bn_name: 'বরিশাল' },
    { id: 44, division_id: 5, name: 'Bhola', bn_name: 'ভোলা' },
    { id: 45, division_id: 5, name: 'Patuakhali', bn_name: 'পটুয়াখালী' },
    { id: 46, division_id: 5, name: 'Pirojpur', bn_name: 'পিরোজপুর' },
    { id: 47, division_id: 5, name: 'Jhalokati', bn_name: 'ঝালকাঠি' },
    { id: 48, division_id: 5, name: 'Barguna', bn_name: 'বরগুনা' },
    { id: 49, division_id: 6, name: 'Rajshahi', bn_name: 'রাজশাহী' },
    { id: 50, division_id: 6, name: 'Chapainawabganj', bn_name: 'চাঁপাইনবাবগঞ্জ' },
    { id: 51, division_id: 6, name: 'Naogaon', bn_name: 'নওগাঁ' },
    { id: 52, division_id: 6, name: 'Natore', bn_name: 'নাটোর' },
    { id: 53, division_id: 6, name: 'Pabna', bn_name: 'পাবনা' },
    { id: 54, division_id: 6, name: 'Sirajganj', bn_name: 'সিরাজগঞ্জ' },
    { id: 55, division_id: 6, name: 'Bogura', bn_name: 'বগুড়া' },
    { id: 56, division_id: 6, name: 'Joypurhat', bn_name: 'জয়পুরহাট' },
    { id: 57, division_id: 7, name: 'Rangpur', bn_name: 'রংপুর' },
    { id: 58, division_id: 7, name: 'Gaibandha', bn_name: 'গাইবান্ধা' },
    { id: 59, division_id: 7, name: 'Kurigram', bn_name: 'কুড়িগ্রাম' },
    { id: 60, division_id: 7, name: 'Nilphamari', bn_name: 'নীলফামারী' },
    { id: 61, division_id: 7, name: 'Lalmonirhat', bn_name: 'লালমনিরহাট' },
    { id: 62, division_id: 7, name: 'Dinajpur', bn_name: 'দিনাজপুর' },
    { id: 63, division_id: 7, name: 'Thakurgaon', bn_name: 'ঠাকুরগাঁও' },
    { id: 64, division_id: 7, name: 'Panchagarh', bn_name: 'পঞ্চগড়' }
];

async function seedDatabase() {
    log('--- Starting Database Seeding ---');
    log('Connecting to database: ' + process.env.DB_NAME);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Check if divisions already seeded
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM divisions');
        if (rows[0].count > 0) {
            log('Database already seeded. Skipping.');
            return;
        }

        log('Seeding data...');

        // 1. Super Admin
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        await connection.query(
            'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            ['superadmin', passwordHash, 'super_admin']
        );
        log('Super admin created.');

        // 2. Divisions
        for (const div of DIVISIONS) {
            await connection.query(
                'INSERT IGNORE INTO divisions (id, name, bn_name) VALUES (?, ?, ?)',
                [div.id, div.name, div.bn_name]
            );
        }
        log('Divisions seeded.');

        // 3. Districts
        for (const dist of DISTRICTS) {
            await connection.query(
                'INSERT IGNORE INTO districts (id, division_id, name, bn_name) VALUES (?, ?, ?, ?)',
                [dist.id, dist.division_id, dist.name, dist.bn_name]
            );
        }
        log('Districts seeded.');

        // 4. Constituencies
        const SEATS = [
            { id: 1, district_id: 1, name: 'ঢাকা-১', name_en: 'Dhaka-1' },
            { id: 2, district_id: 1, name: 'ঢাকা-২', name_en: 'Dhaka-2' },
            { id: 3, district_id: 1, name: 'ঢাকা-৩', name_en: 'Dhaka-3' },
            { id: 4, district_id: 1, name: 'ঢাকা-৪', name_en: 'Dhaka-4' },
            { id: 5, district_id: 1, name: 'ঢাকা-৫', name_en: 'Dhaka-5' },
            { id: 6, district_id: 1, name: 'ঢাকা-৬', name_en: 'Dhaka-6' },
            { id: 7, district_id: 1, name: 'ঢাকা-৭', name_en: 'Dhaka-7' },
            { id: 8, district_id: 1, name: 'ঢাকা-৮', name_en: 'Dhaka-8' },
            { id: 9, district_id: 1, name: 'ঢাকা-৯', name_en: 'Dhaka-9' },
            { id: 10, district_id: 1, name: 'ঢাকা-১০', name_en: 'Dhaka-10' },
            { id: 11, district_id: 1, name: 'ঢাকা-১১', name_en: 'Dhaka-11' },
            { id: 12, district_id: 1, name: 'ঢাকা-১২', name_en: 'Dhaka-12' },
            { id: 13, district_id: 1, name: 'ঢাকা-১৩', name_en: 'Dhaka-13' },
            { id: 14, district_id: 1, name: 'ঢাকা-১৪', name_en: 'Dhaka-14' },
            { id: 15, district_id: 1, name: 'ঢাকা-১৫', name_en: 'Dhaka-15' },
            { id: 16, district_id: 1, name: 'ঢাকা-১৬', name_en: 'Dhaka-16' },
            { id: 17, district_id: 1, name: 'ঢাকা-১৭', name_en: 'Dhaka-17' },
            { id: 18, district_id: 1, name: 'ঢাকা-১৮', name_en: 'Dhaka-18' },
            { id: 19, district_id: 1, name: 'ঢাকা-১৯', name_en: 'Dhaka-19' },
            { id: 20, district_id: 1, name: 'ঢাকা-২০', name_en: 'Dhaka-20' },
            { id: 21, district_id: 2, name: 'গাজীপুর-১', name_en: 'Gazipur-1' },
            { id: 22, district_id: 2, name: 'গাজীপুর-২', name_en: 'Gazipur-2' },
            { id: 23, district_id: 2, name: 'গাজীপুর-৩', name_en: 'Gazipur-3' },
            { id: 24, district_id: 2, name: 'গাজীপুর-৪', name_en: 'Gazipur-4' },
            { id: 25, district_id: 2, name: 'গাজীপুর-৫', name_en: 'Gazipur-5' },
            { id: 26, district_id: 5, name: 'নারায়ণগঞ্জ-১', name_en: 'Narayanganj-1' },
            { id: 27, district_id: 5, name: 'নারায়ণগঞ্জ-২', name_en: 'Narayanganj-2' },
            { id: 28, district_id: 5, name: 'নারায়ণগঞ্জ-৩', name_en: 'Narayanganj-3' },
            { id: 29, district_id: 5, name: 'নারায়ণগঞ্জ-৪', name_en: 'Narayanganj-4' },
            { id: 30, district_id: 5, name: 'নারায়ণগঞ্জ-৫', name_en: 'Narayanganj-5' },
            { id: 31, district_id: 6, name: 'নরসিংদী-১', name_en: 'Narsingdi-1' },
            { id: 32, district_id: 6, name: 'নরসিংদী-২', name_en: 'Narsingdi-2' },
            { id: 33, district_id: 6, name: 'নরসিংদী-৩', name_en: 'Narsingdi-3' },
            { id: 34, district_id: 6, name: 'নরসিংদী-৪', name_en: 'Narsingdi-4' },
            { id: 35, district_id: 6, name: 'নরসিংদী-৫', name_en: 'Narsingdi-5' },
            { id: 36, district_id: 12, name: 'কিশোরগঞ্জ-১', name_en: 'Kishoreganj-1' },
            { id: 37, district_id: 12, name: 'কিশোরগঞ্জ-২', name_en: 'Kishoreganj-2' },
            { id: 38, district_id: 12, name: 'কিশোরগঞ্জ-৩', name_en: 'Kishoreganj-3' },
            { id: 39, district_id: 12, name: 'কিশোরগঞ্জ-৪', name_en: 'Kishoreganj-4' },
            { id: 40, district_id: 12, name: 'কিশোরগঞ্জ-৫', name_en: 'Kishoreganj-5' },
            { id: 41, district_id: 12, name: 'কিশোরগঞ্জ-৬', name_en: 'Kishoreganj-6' },
            { id: 42, district_id: 7, name: 'ফরিদপুর-১', name_en: 'Faridpur-1' },
            { id: 43, district_id: 7, name: 'ফরিদপুর-২', name_en: 'Faridpur-2' },
            { id: 44, district_id: 7, name: 'ফরিদপুর-৩', name_en: 'Faridpur-3' },
            { id: 45, district_id: 7, name: 'ফরিদপুর-৪', name_en: 'Faridpur-4' },
            { id: 46, district_id: 3, name: 'মানিকগঞ্জ-১', name_en: 'Manikganj-1' },
            { id: 47, district_id: 3, name: 'মানিকগঞ্জ-২', name_en: 'Manikganj-2' },
            { id: 48, district_id: 3, name: 'মানিকগঞ্জ-৩', name_en: 'Manikganj-3' },
            { id: 49, district_id: 4, name: 'মুন্সীগঞ্জ-১', name_en: 'Munshiganj-1' },
            { id: 50, district_id: 4, name: 'মুন্সীগঞ্জ-২', name_en: 'Munshiganj-2' },
            { id: 51, district_id: 4, name: 'মুন্সীগঞ্জ-৩', name_en: 'Munshiganj-3' },
            { id: 52, district_id: 8, name: 'গোপালগঞ্জ-১', name_en: 'Gopalganj-1' },
            { id: 53, district_id: 8, name: 'গোপালগঞ্জ-২', name_en: 'Gopalganj-2' },
            { id: 54, district_id: 8, name: 'গোপালগঞ্জ-৩', name_en: 'Gopalganj-3' },
            { id: 55, district_id: 9, name: 'মাদারীপুর-১', name_en: 'Madaripur-1' },
            { id: 56, district_id: 9, name: 'মাদারীপুর-২', name_en: 'Madaripur-2' },
            { id: 57, district_id: 9, name: 'মাদারীপুর-৩', name_en: 'Madaripur-3' },
            { id: 58, district_id: 11, name: 'শরীয়তপুর-১', name_en: 'Shariatpur-1' },
            { id: 59, district_id: 11, name: 'শরীয়তপুর-২', name_en: 'Shariatpur-2' },
            { id: 60, district_id: 11, name: 'শরীয়তপুর-৩', name_en: 'Shariatpur-3' },
            { id: 61, district_id: 10, name: 'রাজবাড়ী-১', name_en: 'Rajbari-1' },
            { id: 62, district_id: 10, name: 'রাজবাড়ী-২', name_en: 'Rajbari-2' },
            { id: 63, district_id: 13, name: 'টাঙ্গাইল-১', name_en: 'Tangail-1' },
            { id: 64, district_id: 13, name: 'টাঙ্গাইল-২', name_en: 'Tangail-2' },
            { id: 65, district_id: 13, name: 'টাঙ্গাইল-৩', name_en: 'Tangail-3' },
            { id: 66, district_id: 13, name: 'টাঙ্গাইল-৪', name_en: 'Tangail-4' },
            { id: 67, district_id: 13, name: 'টাঙ্গাইল-৫', name_en: 'Tangail-5' },
            { id: 68, district_id: 13, name: 'টাঙ্গাইল-৬', name_en: 'Tangail-6' },
            { id: 69, district_id: 13, name: 'টাঙ্গাইল-৭', name_en: 'Tangail-7' },
            { id: 70, district_id: 13, name: 'টাঙ্গাইল-৮', name_en: 'Tangail-8' },
            { id: 71, district_id: 18, name: 'চট্টগ্রাম-১', name_en: 'Chattogram-1' },
            { id: 72, district_id: 18, name: 'চট্টগ্রাম-২', name_en: 'Chattogram-2' },
            { id: 73, district_id: 18, name: 'চট্টগ্রাম-৩', name_en: 'Chattogram-3' },
            { id: 74, district_id: 18, name: 'চট্টগ্রাম-৪', name_en: 'Chattogram-4' },
            { id: 75, district_id: 18, name: 'চট্টগ্রাম-৫', name_en: 'Chattogram-5' },
            { id: 76, district_id: 18, name: 'চট্টগ্রাম-৬', name_en: 'Chattogram-6' },
            { id: 77, district_id: 18, name: 'চট্টগ্রাম-৭', name_en: 'Chattogram-7' },
            { id: 78, district_id: 18, name: 'চট্টগ্রাম-৮', name_en: 'Chattogram-8' },
            { id: 79, district_id: 18, name: 'চট্টগ্রাম-৯', name_en: 'Chattogram-9' },
            { id: 80, district_id: 18, name: 'চট্টগ্রাম-১০', name_en: 'Chattogram-10' },
            { id: 81, district_id: 18, name: 'চট্টগ্রাম-১১', name_en: 'Chattogram-11' },
            { id: 82, district_id: 18, name: 'চট্টগ্রাম-১২', name_en: 'Chattogram-12' },
            { id: 83, district_id: 18, name: 'চট্টগ্রাম-১৩', name_en: 'Chattogram-13' },
            { id: 84, district_id: 18, name: 'চট্টগ্রাম-১৪', name_en: 'Chattogram-14' },
            { id: 85, district_id: 18, name: 'চট্টগ্রাম-১৫', name_en: 'Chattogram-15' },
            { id: 86, district_id: 18, name: 'চট্টগ্রাম-১৬', name_en: 'Chattogram-16' },
            { id: 87, district_id: 19, name: 'কক্সবাজার-১', name_en: 'Cox\'s Bazar-1' },
            { id: 88, district_id: 19, name: 'কক্সবাজার-২', name_en: 'Cox\'s Bazar-2' },
            { id: 89, district_id: 19, name: 'কক্সবাজার-৩', name_en: 'Cox\'s Bazar-3' },
            { id: 90, district_id: 19, name: 'কক্সবাজার-৪', name_en: 'Cox\'s Bazar-4' },
            { id: 91, district_id: 20, name: 'রাঙ্গামাটি-১', name_en: 'Rangamati-1' },
            { id: 92, district_id: 21, name: 'বান্দরবান-১', name_en: 'Bandarban-1' },
            { id: 93, district_id: 22, name: 'খাগড়াছড়ি-১', name_en: 'Khagrachari-1' },
            { id: 94, district_id: 23, name: 'নোয়াখালী-১', name_en: 'Noakhali-1' },
            { id: 95, district_id: 23, name: 'নোয়াখালী-২', name_en: 'Noakhali-2' },
            { id: 96, district_id: 23, name: 'নোয়াখালী-৩', name_en: 'Noakhali-3' },
            { id: 97, district_id: 23, name: 'নোয়াখালী-৪', name_en: 'Noakhali-4' },
            { id: 98, district_id: 23, name: 'নোয়াখালী-৫', name_en: 'Noakhali-5' },
            { id: 99, district_id: 23, name: 'নোয়াখালী-৬', name_en: 'Noakhali-6' },
            { id: 100, district_id: 24, name: 'ফেনী-১', name_en: 'Feni-1' },
            { id: 101, district_id: 24, name: 'ফেনী-২', name_en: 'Feni-2' },
            { id: 102, district_id: 24, name: 'ফেনী-৩', name_en: 'Feni-3' },
            { id: 103, district_id: 25, name: 'লক্ষ্মীপুর-১', name_en: 'Lakshmipur-1' },
            { id: 104, district_id: 25, name: 'লক্ষ্মীপুর-২', name_en: 'Lakshmipur-2' },
            { id: 105, district_id: 25, name: 'লক্ষ্মীপুর-৩', name_en: 'Lakshmipur-3' },
            { id: 106, district_id: 25, name: 'লক্ষ্মীপুর-৪', name_en: 'Lakshmipur-4' },
            { id: 107, district_id: 26, name: 'কুমিল্লা-১', name_en: 'Cumilla-1' },
            { id: 108, district_id: 26, name: 'কুমিল্লা-২', name_en: 'Cumilla-2' },
            { id: 109, district_id: 26, name: 'কুমিল্লা-৩', name_en: 'Cumilla-3' },
            { id: 110, district_id: 26, name: 'কুমিল্লা-৪', name_en: 'Cumilla-4' },
            { id: 111, district_id: 26, name: 'কুমিল্লা-৫', name_en: 'Cumilla-5' },
            { id: 112, district_id: 26, name: 'কুমিল্লা-৬', name_en: 'Cumilla-6' },
            { id: 113, district_id: 26, name: 'কুমিল্লা-৭', name_en: 'Cumilla-7' },
            { id: 114, district_id: 26, name: 'কুমিল্লা-৮', name_en: 'Cumilla-8' },
            { id: 115, district_id: 26, name: 'কুমিল্লা-৯', name_en: 'Cumilla-9' },
            { id: 116, district_id: 26, name: 'কুমিল্লা-১০', name_en: 'Cumilla-10' },
            { id: 117, district_id: 26, name: 'কুমিল্লা-১১', name_en: 'Cumilla-11' },
            { id: 118, district_id: 27, name: 'চাঁদপুর-১', name_en: 'Chandpur-1' },
            { id: 119, district_id: 27, name: 'চাঁদপুর-২', name_en: 'Chandpur-2' },
            { id: 120, district_id: 27, name: 'চাঁদপুর-৩', name_en: 'Chandpur-3' },
            { id: 121, district_id: 27, name: 'চাঁদপুর-৪', name_en: 'Chandpur-4' },
            { id: 122, district_id: 27, name: 'চাঁদপুর-৫', name_en: 'Chandpur-5' },
            { id: 123, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-১', name_en: 'Brahmanbaria-1' },
            { id: 124, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-২', name_en: 'Brahmanbaria-2' },
            { id: 125, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-৩', name_en: 'Brahmanbaria-3' },
            { id: 126, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-৪', name_en: 'Brahmanbaria-4' },
            { id: 127, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-৫', name_en: 'Brahmanbaria-5' },
            { id: 128, district_id: 28, name: 'ব্রাহ্মণবাড়িয়া-৬', name_en: 'Brahmanbaria-6' },
            { id: 129, district_id: 49, name: 'রাজশাহী-১', name_en: 'Rajshahi-1' },
            { id: 130, district_id: 49, name: 'রাজশাহী-২', name_en: 'Rajshahi-2' },
            { id: 131, district_id: 49, name: 'রাজশাহী-৩', name_en: 'Rajshahi-3' },
            { id: 132, district_id: 49, name: 'রাজশাহী-৪', name_en: 'Rajshahi-4' },
            { id: 133, district_id: 49, name: 'রাজশাহী-৫', name_en: 'Rajshahi-5' },
            { id: 134, district_id: 49, name: 'রাজশাহী-৬', name_en: 'Rajshahi-6' },
            { id: 135, district_id: 55, name: 'বগুড়া-১', name_en: 'Bogura-1' },
            { id: 136, district_id: 55, name: 'বগুড়া-২', name_en: 'Bogura-2' },
            { id: 137, district_id: 55, name: 'বগুড়া-৩', name_en: 'Bogura-3' },
            { id: 138, district_id: 55, name: 'বগুড়া-৪', name_en: 'Bogura-4' },
            { id: 139, district_id: 55, name: 'বগুড়া-৫', name_en: 'Bogura-5' },
            { id: 140, district_id: 55, name: 'বগুড়া-৬', name_en: 'Bogura-6' },
            { id: 141, district_id: 55, name: 'বগুড়া-৭', name_en: 'Bogura-7' },
            { id: 142, district_id: 51, name: 'নওগাঁ-১', name_en: 'Naogaon-1' },
            { id: 143, district_id: 51, name: 'নওগাঁ-২', name_en: 'Naogaon-2' },
            { id: 144, district_id: 51, name: 'নওগাঁ-৩', name_en: 'Naogaon-3' },
            { id: 145, district_id: 51, name: 'নওগাঁ-৪', name_en: 'Naogaon-4' },
            { id: 146, district_id: 51, name: 'নওগাঁ-৫', name_en: 'Naogaon-5' },
            { id: 147, district_id: 51, name: 'নওগাঁ-৬', name_en: 'Naogaon-6' },
            { id: 148, district_id: 54, name: 'সিরাজগঞ্জ-১', name_en: 'Sirajganj-1' },
            { id: 149, district_id: 54, name: 'সিরাজগঞ্জ-২', name_en: 'Sirajganj-2' },
            { id: 150, district_id: 54, name: 'সিরাজগঞ্জ-৩', name_en: 'Sirajganj-3' },
            { id: 151, district_id: 54, name: 'সিরাজগঞ্জ-৪', name_en: 'Sirajganj-4' },
            { id: 152, district_id: 54, name: 'সিরাজগঞ্জ-৫', name_en: 'Sirajganj-5' },
            { id: 153, district_id: 54, name: 'সিরাজগঞ্জ-৬', name_en: 'Sirajganj-6' },
            { id: 154, district_id: 53, name: 'পাবনা-১', name_en: 'Pabna-1' },
            { id: 155, district_id: 53, name: 'পাবনা-২', name_en: 'Pabna-2' },
            { id: 156, district_id: 53, name: 'পাবনা-৩', name_en: 'Pabna-3' },
            { id: 157, district_id: 53, name: 'পাবনা-৪', name_en: 'Pabna-4' },
            { id: 158, district_id: 53, name: 'পাবনা-৫', name_en: 'Pabna-5' },
            { id: 159, district_id: 52, name: 'নাটোর-১', name_en: 'Natore-1' },
            { id: 160, district_id: 52, name: 'নাটোর-২', name_en: 'Natore-2' },
            { id: 161, district_id: 52, name: 'নাটোর-৩', name_en: 'Natore-3' },
            { id: 162, district_id: 52, name: 'নাটোর-৪', name_en: 'Natore-4' },
            { id: 163, district_id: 50, name: 'চাঁপাইনবাবগঞ্জ-১', name_en: 'Chapainawabganj-1' },
            { id: 164, district_id: 50, name: 'চাঁপাইনবাবগঞ্জ-২', name_en: 'Chapainawabganj-2' },
            { id: 165, district_id: 50, name: 'চাঁপাইনবাবগঞ্জ-৩', name_en: 'Chapainawabganj-3' },
            { id: 166, district_id: 56, name: 'জয়পুরহাট-১', name_en: 'Joypurhat-1' },
            { id: 167, district_id: 56, name: 'জয়পুরহাট-২', name_en: 'Joypurhat-2' },
            { id: 168, district_id: 36, name: 'যশোর-১', name_en: 'Jashore-1' },
            { id: 169, district_id: 36, name: 'যশোর-২', name_en: 'Jashore-2' },
            { id: 170, district_id: 36, name: 'যশোর-৩', name_en: 'Jashore-3' },
            { id: 171, district_id: 36, name: 'যশোর-৪', name_en: 'Jashore-4' },
            { id: 172, district_id: 36, name: 'যশোর-৫', name_en: 'Jashore-5' },
            { id: 173, district_id: 36, name: 'যশোর-৬', name_en: 'Jashore-6' },
            { id: 174, district_id: 33, name: 'খুলনা-১', name_en: 'Khulna-1' },
            { id: 175, district_id: 33, name: 'খুলনা-২', name_en: 'Khulna-2' },
            { id: 176, district_id: 33, name: 'খুলনা-৩', name_en: 'Khulna-3' },
            { id: 177, district_id: 33, name: 'খুলনা-৪', name_en: 'Khulna-4' },
            { id: 178, district_id: 33, name: 'খুলনা-৫', name_en: 'Khulna-5' },
            { id: 179, district_id: 33, name: 'খুলনা-৬', name_en: 'Khulna-6' },
            { id: 180, district_id: 39, name: 'কুষ্টিয়া-১', name_en: 'Kushtia-1' },
            { id: 181, district_id: 39, name: 'কুষ্টিয়া-২', name_en: 'Kushtia-2' },
            { id: 182, district_id: 39, name: 'কুষ্টিয়া-৩', name_en: 'Kushtia-3' },
            { id: 183, district_id: 39, name: 'কুষ্টিয়া-৪', name_en: 'Kushtia-4' },
            { id: 184, district_id: 40, name: 'ঝিনাইদহ-১', name_en: 'Jhenaidah-1' },
            { id: 185, district_id: 40, name: 'ঝিনাইদহ-২', name_en: 'Jhenaidah-2' },
            { id: 186, district_id: 40, name: 'ঝিনাইদহ-৩', name_en: 'Jhenaidah-3' },
            { id: 187, district_id: 40, name: 'ঝিনাইদহ-৪', name_en: 'Jhenaidah-4' },
            { id: 188, district_id: 34, name: 'বাগেরহাট-১', name_en: 'Bagerhat-1' },
            { id: 189, district_id: 34, name: 'বাগেরহাট-২', name_en: 'Bagerhat-2' },
            { id: 190, district_id: 34, name: 'বাগেরহাট-৩', name_en: 'Bagerhat-3' },
            { id: 191, district_id: 34, name: 'বাগেরহাট-৪', name_en: 'Bagerhat-4' },
            { id: 192, district_id: 35, name: 'সাতক্ষীরা-১', name_en: 'Satkhira-1' },
            { id: 193, district_id: 35, name: 'সাতক্ষীরা-২', name_en: 'Satkhira-2' },
            { id: 194, district_id: 35, name: 'সাতক্ষীরা-৩', name_en: 'Satkhira-3' },
            { id: 195, district_id: 35, name: 'সাতক্ষীরা-৪', name_en: 'Satkhira-4' },
            { id: 196, district_id: 42, name: 'মেহেরপুর-১', name_en: 'Meherpur-1' },
            { id: 197, district_id: 42, name: 'মেহেরপুর-২', name_en: 'Meherpur-2' },
            { id: 198, district_id: 41, name: 'চুয়াডাঙ্গা-১', name_en: 'Chuadanga-1' },
            { id: 199, district_id: 41, name: 'চুয়াডাঙ্গা-২', name_en: 'Chuadanga-2' },
            { id: 200, district_id: 37, name: 'মাগুরা-১', name_en: 'Magura-1' },
            { id: 201, district_id: 37, name: 'মাগুরা-২', name_en: 'Magura-2' },
            { id: 202, district_id: 38, name: 'নড়াইল-১', name_en: 'Narail-1' },
            { id: 203, district_id: 38, name: 'নড়াইল-২', name_en: 'Narail-2' },
            { id: 204, district_id: 43, name: 'বরিশাল-১', name_en: 'Barishal-1' },
            { id: 205, district_id: 43, name: 'বরিশাল-২', name_en: 'Barishal-2' },
            { id: 206, district_id: 43, name: 'বরিশাল-৩', name_en: 'Barishal-3' },
            { id: 207, district_id: 43, name: 'বরিশাল-৪', name_en: 'Barishal-4' },
            { id: 208, district_id: 43, name: 'বরিশাল-৫', name_en: 'Barishal-5' },
            { id: 209, district_id: 43, name: 'বরিশাল-৬', name_en: 'Barishal-6' },
            { id: 210, district_id: 45, name: 'পটুয়াখালী-১', name_en: 'Patuakhali-1' },
            { id: 211, district_id: 45, name: 'পটুয়াখালী-২', name_en: 'Patuakhali-2' },
            { id: 212, district_id: 45, name: 'পটুয়াখালী-৩', name_en: 'Patuakhali-3' },
            { id: 213, district_id: 45, name: 'পটুয়াখালী-৪', name_en: 'Patuakhali-4' },
            { id: 214, district_id: 44, name: 'ভোলা-১', name_en: 'Bhola-1' },
            { id: 215, district_id: 44, name: 'ভোলা-২', name_en: 'Bhola-2' },
            { id: 216, district_id: 44, name: 'ভোলা-৩', name_en: 'Bhola-3' },
            { id: 217, district_id: 44, name: 'ভোলা-৪', name_en: 'Bhola-4' },
            { id: 218, district_id: 46, name: 'পিরোজপুর-১', name_en: 'Pirojpur-1' },
            { id: 219, district_id: 46, name: 'পিরোজপুর-২', name_en: 'Pirojpur-2' },
            { id: 220, district_id: 46, name: 'পিরোজপুর-৩', name_en: 'Pirojpur-3' },
            { id: 221, district_id: 48, name: 'বরগুনা-১', name_en: 'Barguna-1' },
            { id: 222, district_id: 48, name: 'বরগুনা-২', name_en: 'Barguna-2' },
            { id: 223, district_id: 47, name: 'ঝালকাঠি-১', name_en: 'Jhalokati-1' },
            { id: 224, district_id: 47, name: 'ঝালকাঠি-২', name_en: 'Jhalokati-2' },
            { id: 225, district_id: 57, name: 'রংপুর-১', name_en: 'Rangpur-1' },
            { id: 226, district_id: 57, name: 'রংপুর-২', name_en: 'Rangpur-2' },
            { id: 227, district_id: 57, name: 'রংপুর-৩', name_en: 'Rangpur-3' },
            { id: 228, district_id: 57, name: 'রংপুর-৪', name_en: 'Rangpur-4' },
            { id: 229, district_id: 57, name: 'রংপুর-৫', name_en: 'Rangpur-5' },
            { id: 230, district_id: 57, name: 'রংপুর-৬', name_en: 'Rangpur-6' },
            { id: 231, district_id: 62, name: 'দিনাজপুর-১', name_en: 'Dinajpur-1' },
            { id: 232, district_id: 62, name: 'দিনাজপুর-২', name_en: 'Dinajpur-2' },
            { id: 233, district_id: 62, name: 'দিনাজপুর-৩', name_en: 'Dinajpur-3' },
            { id: 234, district_id: 62, name: 'দিনাজপুর-৪', name_en: 'Dinajpur-4' },
            { id: 235, district_id: 62, name: 'দিনাজপুর-৫', name_en: 'Dinajpur-5' },
            { id: 236, district_id: 62, name: 'দিনাজপুর-৬', name_en: 'Dinajpur-6' },
            { id: 237, district_id: 64, name: 'পঞ্চগড়-১', name_en: 'Panchagarh-1' },
            { id: 238, district_id: 64, name: 'পঞ্চগড়-২', name_en: 'Panchagarh-2' },
            { id: 239, district_id: 58, name: 'গাইবান্ধা-১', name_en: 'Gaibandha-1' },
            { id: 240, district_id: 58, name: 'গাইবান্ধা-২', name_en: 'Gaibandha-2' },
            { id: 241, district_id: 58, name: 'গাইবান্ধা-৩', name_en: 'Gaibandha-3' },
            { id: 242, district_id: 58, name: 'গাইবান্ধা-৪', name_en: 'Gaibandha-4' },
            { id: 243, district_id: 58, name: 'গাইবান্ধা-৫', name_en: 'Gaibandha-5' },
            { id: 244, district_id: 59, name: 'কুড়িগ্রাম-১', name_en: 'Kurigram-1' },
            { id: 245, district_id: 59, name: 'কুড়িগ্রাম-২', name_en: 'Kurigram-2' },
            { id: 246, district_id: 59, name: 'কুড়িগ্রাম-৩', name_en: 'Kurigram-3' },
            { id: 247, district_id: 59, name: 'কুড়িগ্রাম-৪', name_en: 'Kurigram-4' },
            { id: 248, district_id: 60, name: 'নীলফামারী-১', name_en: 'Nilphamari-1' },
            { id: 249, district_id: 60, name: 'নীলফামারী-২', name_en: 'Nilphamari-2' },
            { id: 250, district_id: 60, name: 'নীলফামারী-৩', name_en: 'Nilphamari-3' },
            { id: 251, district_id: 60, name: 'নীলফামারী-৪', name_en: 'Nilphamari-4' },
            { id: 252, district_id: 63, name: 'ঠাকুরগাঁও-১', name_en: 'Thakurgaon-1' },
            { id: 253, district_id: 63, name: 'ঠাকুরগাঁও-২', name_en: 'Thakurgaon-2' },
            { id: 254, district_id: 63, name: 'ঠাকুরগাঁও-৩', name_en: 'Thakurgaon-3' },
            { id: 255, district_id: 61, name: 'লালমনিরহাট-১', name_en: 'Lalmonirhat-1' },
            { id: 256, district_id: 61, name: 'লালমনিরহাট-২', name_en: 'Lalmonirhat-2' },
            { id: 257, district_id: 61, name: 'লালমনিরহাট-৩', name_en: 'Lalmonirhat-3' },
            { id: 258, district_id: 14, name: 'ময়মনসিংহ-১', name_en: 'Mymensingh-1' },
            { id: 259, district_id: 14, name: 'ময়মনসিংহ-২', name_en: 'Mymensingh-2' },
            { id: 260, district_id: 14, name: 'ময়মনসিংহ-৩', name_en: 'Mymensingh-3' },
            { id: 261, district_id: 14, name: 'ময়মনসিংহ-৪', name_en: 'Mymensingh-4' },
            { id: 262, district_id: 14, name: 'ময়মনসিংহ-৫', name_en: 'Mymensingh-5' },
            { id: 263, district_id: 14, name: 'ময়মনসিংহ-৬', name_en: 'Mymensingh-6' },
            { id: 264, district_id: 14, name: 'ময়মনসিংহ-৭', name_en: 'Mymensingh-7' },
            { id: 265, district_id: 14, name: 'ময়মনসিংহ-৮', name_en: 'Mymensingh-8' },
            { id: 266, district_id: 14, name: 'ময়মনসিংহ-৯', name_en: 'Mymensingh-9' },
            { id: 267, district_id: 14, name: 'ময়মনসিংহ-১০', name_en: 'Mymensingh-10' },
            { id: 268, district_id: 14, name: 'ময়মনসিংহ-১১', name_en: 'Mymensingh-11' },
            { id: 269, district_id: 15, name: 'জামালপুর-১', name_en: 'Jamalpur-1' },
            { id: 270, district_id: 15, name: 'জামালপুর-২', name_en: 'Jamalpur-2' },
            { id: 271, district_id: 15, name: 'জামালপুর-৩', name_en: 'Jamalpur-3' },
            { id: 272, district_id: 15, name: 'জামালপুর-৪', name_en: 'Jamalpur-4' },
            { id: 273, district_id: 15, name: 'জামালপুর-৫', name_en: 'Jamalpur-5' },
            { id: 274, district_id: 16, name: 'নেত্রকোণা-১', name_en: 'Netrokona-1' },
            { id: 275, district_id: 16, name: 'নেত্রকোণা-২', name_en: 'Netrokona-2' },
            { id: 276, district_id: 16, name: 'নেত্রকোণা-৩', name_en: 'Netrokona-3' },
            { id: 277, district_id: 16, name: 'নেত্রকোণা-৪', name_en: 'Netrokona-4' },
            { id: 278, district_id: 16, name: 'নেত্রকোণা-৫', name_en: 'Netrokona-5' },
            { id: 279, district_id: 17, name: 'শেরপুর-১', name_en: 'Sherpur-1' },
            { id: 280, district_id: 17, name: 'শেরপুর-২', name_en: 'Sherpur-2' },
            { id: 281, district_id: 17, name: 'শেরপুর-৩', name_en: 'Sherpur-3' },
            { id: 282, district_id: 29, name: 'সিলেট-১', name_en: 'Sylhet-1' },
            { id: 283, district_id: 29, name: 'সিলেট-২', name_en: 'Sylhet-2' },
            { id: 284, district_id: 29, name: 'সিলেট-৩', name_en: 'Sylhet-3' },
            { id: 285, district_id: 29, name: 'সিলেট-৪', name_en: 'Sylhet-4' },
            { id: 286, district_id: 29, name: 'সিলেট-৫', name_en: 'Sylhet-5' },
            { id: 287, district_id: 29, name: 'সিলেট-৬', name_en: 'Sylhet-6' },
            { id: 288, district_id: 32, name: 'সুনামগঞ্জ-১', name_en: 'Sunamganj-1' },
            { id: 289, district_id: 32, name: 'সুনামগঞ্জ-২', name_en: 'Sunamganj-2' },
            { id: 290, district_id: 32, name: 'সুনামগঞ্জ-৩', name_en: 'Sunamganj-3' },
            { id: 291, district_id: 32, name: 'সুনামগঞ্জ-৪', name_en: 'Sunamganj-4' },
            { id: 292, district_id: 32, name: 'সুনামগঞ্জ-৫', name_en: 'Sunamganj-5' },
            { id: 293, district_id: 30, name: 'মৌলভীবাজার-১', name_en: 'Moulivibazar-1' },
            { id: 294, district_id: 30, name: 'মৌলভীবাজার-২', name_en: 'Moulivibazar-2' },
            { id: 295, district_id: 30, name: 'মৌলভীবাজার-৩', name_en: 'Moulivibazar-3' },
            { id: 296, district_id: 30, name: 'মৌলভীবাজার-৪', name_en: 'Moulivibazar-4' },
            { id: 297, district_id: 31, name: 'হবিগঞ্জ-১', name_en: 'Habiganj-1' },
            { id: 298, district_id: 31, name: 'হবিগঞ্জ-২', name_en: 'Habiganj-2' },
            { id: 299, district_id: 31, name: 'হবিগঞ্জ-৩', name_en: 'Habiganj-3' },
            { id: 300, district_id: 31, name: 'হবিগঞ্জ-৪', name_en: 'Habiganj-4' }
        ];

        for (const seat of SEATS) {
            const constituencyNo = parseInt(seat.name_en.split('-')[1]);
            await connection.query(
                'INSERT IGNORE INTO constituencies (id, district_id, name, bn_name, constituency_no) VALUES (?, ?, ?, ?, ?)',
                [seat.id, seat.district_id, seat.name_en, seat.name, constituencyNo]
            );
        }
        log('Constituencies seeded.');

        log('Database seeding completed successfully!');
    } catch (error) {
        log('Error seeding database: ' + error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = seedDatabase;

if (require.main === module) {
    seedDatabase().catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
}
