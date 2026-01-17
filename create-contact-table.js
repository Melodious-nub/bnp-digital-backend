const mysql = require('mysql2/promise');
require('dotenv').config();

async function createContactTable() {
    console.log('=== Creating contact_messages table ===\n');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bnp_db'
        });

        console.log('✓ Connected to database:', process.env.DB_NAME);

        // Create the table
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

        console.log('✓ Table contact_messages created/verified\n');

        // Verify it exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'contact_messages'");
        if (tables.length > 0) {
            console.log('✓ Verification: Table EXISTS in database');

            // Show structure
            const [columns] = await connection.query("DESCRIBE contact_messages");
            console.log('\nTable Structure:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `[${col.Key}]` : ''}`);
            });
        } else {
            console.log('✗ ERROR: Table was not created!');
        }

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✓ Database connection closed');
        }
    }
}

createContactTable();
