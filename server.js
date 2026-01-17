require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const initializeDatabase = require('./init-db');
const seedDatabase = require('./seed-data');

const { swaggerUi, swaggerSpec } = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const teamRoutes = require('./routes/teamRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const excelRoutes = require('./routes/excelRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/contact', contactRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
    res.send('BNP Digital Platform API is Running');
});

// Database Initialization and Server Start
async function startServer() {
    try {
        console.log('Starting system initialization...');

        // Initialize DB Schema
        await initializeDatabase();

        // Seed Initial Data
        await seedDatabase();

        // Test Connection
        const connection = await db.getConnection();
        console.log('Database connected successfully');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
