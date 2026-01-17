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
    { id: 2, name: 'Chittagong', bn_name: 'চট্টগ্রাম' },
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
    { id: 18, division_id: 2, name: 'Chittagong', bn_name: 'চট্টগ্রাম' },
    { id: 19, division_id: 2, name: 'Cox\'s Bazar', bn_name: 'কক্সবাজার' },
    { id: 20, division_id: 2, name: 'Rangamati', bn_name: 'রাঙ্গামাটি' },
    { id: 21, division_id: 2, name: 'Bandarban', bn_name: 'বান্দরবান' },
    { id: 22, division_id: 2, name: 'Khagrachhari', bn_name: 'খাগড়াছড়ি' },
    { id: 23, division_id: 2, name: 'Noakhali', bn_name: 'নোয়াখালী' },
    { id: 24, division_id: 2, name: 'Feni', bn_name: 'ফেনী' },
    { id: 25, division_id: 2, name: 'Lakshmipur', bn_name: 'লক্ষ্্মীপুর' },
    { id: 26, division_id: 2, name: 'Comilla', bn_name: 'কুমিল্লা' },
    { id: 27, division_id: 2, name: 'Chandpur', bn_name: 'চাঁদপুর' },
    { id: 28, division_id: 2, name: 'Brahmanbaria', bn_name: 'ব্রাহ্মণবাড়িয়া' },
    { id: 29, division_id: 3, name: 'Sylhet', bn_name: 'সিলেট' },
    { id: 30, division_id: 3, name: 'Moulvibazar', bn_name: 'মৌলভীবাজার' },
    { id: 31, division_id: 3, name: 'Habiganj', bn_name: 'হবিগঞ্জ' },
    { id: 32, division_id: 3, name: 'Sunamganj', bn_name: 'সুনামগঞ্জ' },
    { id: 33, division_id: 4, name: 'Khulna', bn_name: 'খুলনা' },
    { id: 34, division_id: 4, name: 'Bagerhat', bn_name: 'বাগেরহাট' },
    { id: 35, division_id: 4, name: 'Sathkhira', bn_name: 'সাতক্ষীরা' },
    { id: 36, division_id: 4, name: 'Jessore', bn_name: 'যশোর' },
    { id: 37, division_id: 4, name: 'Magura', bn_name: 'মাগুরা' },
    { id: 38, division_id: 4, name: 'Narail', bn_name: 'নড়াইল' },
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
    { id: 50, division_id: 6, name: 'Chapai Nawabganj', bn_name: 'চাঁপাইনবাবগঞ্জ' },
    { id: 51, division_id: 6, name: 'Naogaon', bn_name: 'নওগাঁ' },
    { id: 52, division_id: 6, name: 'Natore', bn_name: 'নাটোর' },
    { id: 53, division_id: 6, name: 'Pabna', bn_name: 'পাবনা' },
    { id: 54, division_id: 6, name: 'Sirajganj', bn_name: 'সিরাজগঞ্জ' },
    { id: 55, division_id: 6, name: 'Bogra', bn_name: 'বগুড়া' },
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
            { id: 25, district_id: 2, name: 'গাজীপুর-৫', name_en: 'Gazipur-5' }
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
