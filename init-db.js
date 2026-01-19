const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFile = path.join(__dirname, 'init-log.txt');
function log(msg) {
    const timestampedMsg = `[${new Date().toISOString()}] ${msg}`;
    console.log(timestampedMsg);
    try {
        fs.appendFileSync(logFile, timestampedMsg + '\n');
    } catch (e) { }
}

async function initializeDatabase() {
    log('--- Starting Database Initialization ---');

    try {
        log('Connecting to MySQL host: ' + process.env.DB_HOST);

        let connection;
        let dbExists = false;

        // 1. Try to connect directly with the database first (Production behavior)
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                multipleStatements: true
            });
            log(`Successfully connected to database '${process.env.DB_NAME}'.`);
            dbExists = true;
        } catch (connError) {
            // If the database doesn't exist (ER_BAD_DB_ERROR), try to create it (Local behavior)
            if (connError.code === 'ER_BAD_DB_ERROR') {
                log(`Database '${process.env.DB_NAME}' does not exist. Attempting to create...`);
                const connectionBase = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                });

                try {
                    await connectionBase.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
                    log(`Database '${process.env.DB_NAME}' created/ensured.`);
                    dbExists = true;
                } catch (createErr) {
                    log('Error creating database: ' + createErr.message);
                    throw createErr;
                } finally {
                    await connectionBase.end();
                }

                // Now connect to the newly created database
                connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    multipleStatements: true
                });
            } else {
                // If it's some other error (like Access Denied to host), throw it
                throw connError;
            }
        }


        try {
            // Check if tables already exist by checking for the 'users' table
            const [tables] = await connection.query(`SHOW TABLES LIKE 'users'`);

            // Force create contact_messages if it doesn't exist (Fix for existing dbs)
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
            log('Ensured table contact_messages exists.');

            if (tables.length > 0) {
                log('Database tables already exist. Skipping full schema application.');
                return; // SKIP
            }

            const schemaPath = path.join(__dirname, 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                await connection.query(schema);
                log('Schema application completed successfully.');
            } else {
                log('schema.sql not found!');
            }
        } catch (error) {
            log('Error reading/applying schema: ' + error.message);
            throw error;
        } finally {
            await connection.end();
        }

        log('Database initialization completed.');
    } catch (globalError) {
        log('Global Error: ' + globalError.message);
        throw globalError;
    }
}

module.exports = initializeDatabase;

if (require.main === module) {
    fs.writeFileSync(logFile, 'Starting database initialization...\n');
    initializeDatabase().catch(err => {
        console.error('Initialization failed:', err);
        process.exit(1);
    });
}
