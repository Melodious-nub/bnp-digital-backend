const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * @openapi
 * components:
 *   schemas:
 *     RegistrationRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: (Public) Register a new candidate
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - candidateNameEn
 *               - candidateNameBn
 *               - divisionId
 *               - districtId
 *               - constituteNo
 *               - password
 *             properties:
 *               candidateNameEn:
 *                 type: string
 *               candidateNameBn:
 *                 type: string
 *               divisionId:
 *                 type: integer
 *               districtId:
 *                 type: integer
 *               constituteNo:
 *                 type: integer
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 userId: { type: integer }
 *                 username: { type: string }
 *                 slug: { type: string }
 *       400:
 *         description: Invalid input or user already exists
 */
exports.register = async (req, res) => {
    let connection;
    try {
        const {
            candidateNameEn,
            candidateNameBn,
            divisionId,
            districtId,
            constituteNo,
            password
        } = req.body;

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 1. Generate userId: District Name + Constitute Number
        // Fetch district name
        const [districts] = await db.query('SELECT name FROM districts WHERE id = ?', [districtId]);
        if (districts.length === 0) {
            return res.status(400).json({ message: 'Invalid district ID' });
        }
        const districtName = districts[0].name.replace(/\s+/g, '');
        const username = `${districtName}${constituteNo}`;

        // 2. Start transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check if user exists
        const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: `User ${username} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'candidate']
        );
        const userId = userResult.insertId;

        // 4. Insert into candidates
        // Slug is the username (e.g., dhaka1)
        const slug = username.toLowerCase();
        await connection.query(
            `INSERT INTO candidates (
                user_id, slug, full_name_en, full_name_bn, division_id, district_id, 
                constituency_no, photo_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, slug, candidateNameEn, candidateNameBn, divisionId, districtId, constituteNo, photoUrl]
        );

        await connection.commit();
        res.status(201).json({
            message: 'Candidate registered successfully',
            userId: userId,
            username: username,
            slug: slug
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: (Public) Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       410:
 *         description: Invalid credentials
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     summary: Update candidate profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
        if (candidate.length === 0) {
            return res.status(404).json({ message: 'Candidate profile not found' });
        }

        const candidateId = candidate[0].id;

        let query = 'UPDATE candidates SET ';
        const params = [];
        const fields = {
            candidateNameEn: 'full_name_en',
            candidateNameBn: 'full_name_bn',
            designation: 'designation',
            briefIntro: 'brief_intro',
            introBn: 'intro_bn',
            politicalJourney: 'political_journey',
            politicalJourneyBn: 'political_journey_bn',
            personalProfile: 'personal_profile',
            personalProfileBn: 'personal_profile_bn',
            vision: 'vision',
            visionBn: 'vision_bn',
            facebookLink: 'facebook_link',
            responsiblePerson: 'responsible_person',
            email: 'email'
        };

        Object.keys(fields).forEach(key => {
            if (updates[key] !== undefined) {
                query += `${fields[key]} = ?, `;
                params.push(updates[key]);
            }
        });

        if (photoUrl) {
            query += 'photo_url = ?, ';
            params.push(photoUrl);
        }

        // Remove trailing comma and space
        if (params.length === 0) {
            return res.json({ message: 'No changes provided' });
        }

        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        params.push(candidateId);

        await db.query(query, params);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/auth/divisions:
 *   get:
 *     summary: (Public) Get all divisions
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of divisions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   bn_name: { type: string }
 */
exports.getDivisions = async (req, res) => {
    try {
        const [divisions] = await db.query('SELECT * FROM divisions');
        res.json(divisions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/auth/districts:
 *   get:
 *     summary: (Public) Get districts by division
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema: { type: integer }
 *         description: Filter districts by division ID
 *     responses:
 *       200:
 *         description: List of districts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   division_id: { type: integer }
 *                   name: { type: string }
 *                   bn_name: { type: string }
 */
exports.getDistricts = async (req, res) => {
    try {
        const { divisionId } = req.query;
        let query = 'SELECT * FROM districts';
        const params = [];
        if (divisionId) {
            query += ' WHERE division_id = ?';
            params.push(divisionId);
        }
        const [districts] = await db.query(query, params);
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/auth/constituencies:
 *   get:
 *     summary: (Public) Get constituencies by district
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: districtId
 *         schema: { type: integer }
 *         description: Filter by district ID
 *     responses:
 *       200:
 *         description: List of constituencies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   district_id: { type: integer }
 *                   constituency_no: { type: integer }
 *                   name: { type: string }
 *                   bn_name: { type: string }
 */
exports.getConstituencies = async (req, res) => {
    try {
        const { districtId } = req.query;
        let query = 'SELECT * FROM constituencies';
        const params = [];
        if (districtId) {
            query += ' WHERE district_id = ?';
            params.push(districtId);
        }
        const [constituencies] = await db.query(query, params);
        res.json(constituencies);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
