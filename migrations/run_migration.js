const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'votegxlv_root',
        password: process.env.DB_PASSWORD || 'kV.GdTV-Oqlw',
        database: process.env.DB_NAME || 'votegxlv_mainDb'
    });

    try {
        console.log('Running migration: add_contact_messages...');

        await connection.query(`
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
            )
        `);

        console.log('✅ Migration completed successfully!');
        console.log('Table contact_messages created.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
