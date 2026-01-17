const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bnp_db'
    });

    try {
        const [tables] = await connection.query("SHOW TABLES LIKE 'contact_messages'");

        if (tables.length > 0) {
            console.log('✅ Table contact_messages EXISTS');
            const [columns] = await connection.query("DESCRIBE contact_messages");
            console.log('\nTable structure:');
            console.table(columns);
        } else {
            console.log('❌ Table contact_messages DOES NOT EXIST');
            console.log('\nCreating table now...');

            await connection.query(`
                CREATE TABLE contact_messages (
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

            console.log('✅ Table created successfully!');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTable();
