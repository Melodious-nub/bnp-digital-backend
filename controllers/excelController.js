const db = require('../config/db');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');

/**
 * @openapi
 * /api/excel/import:
 *   post:
 *     summary: Import candidates from Excel
 *     tags: [Excel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Data imported successfully
 */
exports.importCandidates = async (req, res) => {
    let connection;
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        connection = await db.getConnection();
        await connection.beginTransaction();

        for (const row of data) {
            // Fields: Division, District, Constituency_No, প্রার্থির_নাম, Candidate_Name_En, Brief_Intro, প্রারম্ভ, Political_Journey, রাজনৈতিক_যাত্রা, Personal_Profile, ব্যাক্তিগত_জীবন, Vision, এলাকা_নিয়ে_তার_স্বপ্ন, Facebook_Link, Responsible_Person, Email

            const {
                Division, District, Constituency_No, প্রার্থির_নাম, Candidate_Name_En,
                Brief_Intro, প্রারম্ভ, Political_Journey, রাজনৈতিক_যাত্রা,
                Personal_Profile, ব্যাক্তিগত_জীবন, Vision, এলাকা_নিয়ে_তার_স্বপ্ন,
                Facebook_Link, Responsible_Person, Email
            } = row;

            // 1. Get IDs
            const [divs] = await connection.query('SELECT id FROM divisions WHERE name = ?', [Division]);
            const [dists] = await connection.query('SELECT id FROM districts WHERE name = ?', [District]);

            if (divs.length === 0 || dists.length === 0) continue;

            const divisionId = divs[0].id;
            const districtId = dists[0].id;
            const username = `${District.replace(/\s+/g, '')}${Constituency_No}`;
            const slug = username.toLowerCase();

            // 2. Upsert User
            const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);
            let userId;

            if (existingUser.length === 0) {
                const hashedPassword = await bcrypt.hash('Admin@123', 10); // Default password for bulk import
                const [userResult] = await connection.query(
                    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, 'candidate']
                );
                userId = userResult.insertId;
            } else {
                userId = existingUser[0].id;
            }

            // 3. Upsert Candidate
            const [existingCandidate] = await connection.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);

            const candidateData = [
                userId, slug, Candidate_Name_En, প্রার্থির_নাম, divisionId, districtId,
                Constituency_No, Brief_Intro, প্রারম্ভ, Political_Journey, রাজনৈতিক_যাত্রা,
                Personal_Profile, ব্যাক্তিগত_জীবন, Vision, এলাকা_নিয়ে_তার_স্বপ্ন,
                Facebook_Link, Responsible_Person, Email
            ];

            if (existingCandidate.length === 0) {
                await connection.query(
                    `INSERT INTO candidates (
                        user_id, slug, full_name_en, full_name_bn, division_id, district_id,
                        constituency_no, brief_intro, intro_bn, political_journey, political_journey_bn,
                        personal_profile, personal_profile_bn, vision, vision_bn,
                        facebook_link, responsible_person, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    candidateData
                );
            } else {
                await connection.query(
                    `UPDATE candidates SET 
                        slug = ?, full_name_en = ?, full_name_bn = ?, division_id = ?, district_id = ?,
                        constituency_no = ?, brief_intro = ?, intro_bn = ?, political_journey = ?, political_journey_bn = ?,
                        personal_profile = ?, personal_profile_bn = ?, vision = ?, vision_bn = ?,
                        facebook_link = ?, responsible_person = ?, email = ?
                    WHERE user_id = ?`,
                    [...candidateData.slice(1), userId]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Excel data imported successfully' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};
