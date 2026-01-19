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

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        let successCount = 0;
        let skippedRows = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // Offset for header and 0-index

            // Mandatory Fields
            const rawDivision = row['Division'];
            const rawDistrict = row['District'];
            const rawConstituencyNo = row['Constituency_No'];

            if (!rawDivision || !rawDistrict || !rawConstituencyNo) {
                skippedRows.push({ row: rowNum, error: 'Missing mandatory fields (Division, District, or Constituency_No)' });
                continue;
            }

            const divisionName = rawDivision.toString().trim();
            const districtName = rawDistrict.toString().trim();
            const constituencyNo = parseInt(rawConstituencyNo);

            if (isNaN(constituencyNo)) {
                skippedRows.push({ row: rowNum, error: 'Constituency_No must be a number' });
                continue;
            }

            // Optional Fields
            const fullNameBn = (row['প্রার্থির_নাম'] || row['প্রার্থীর_নাম'] || '').toString().trim();
            const fullNameEn = (row['Candidate_Name_En'] || '').toString().trim();
            const briefIntro = (row['Brief_Intro'] || '').toString().trim();
            const introBn = (row['প্রারম্ভ'] || '').toString().trim();
            const politicalJourney = (row['Political_Journey'] || '').toString().trim();
            const politicalJourneyBn = (row['রাজনৈতিক_যাত্রা'] || '').toString().trim();
            const personalProfile = (row['Personal_Profile'] || '').toString().trim();
            const personalProfileBn = (row['ব্যাক্তিগত_জীবন'] || row['ব্যক্তিগত_জীবন'] || '').toString().trim();
            const vision = (row['Vision'] || '').toString().trim();
            const visionBn = (row['এলাকা_নিয়ে_তার_স্বপ্ন'] || row['এলাকা_নিয়ে_তার_স্বপ্ন'] || '').toString().trim();
            const facebookLink = (row['Facebook_Link'] || '').toString().trim();
            const responsiblePerson = (row['Responsible_Person'] || '').toString().trim();
            const email = (row['Email'] || '').toString().trim();

            // 1. Get IDs
            const [divs] = await connection.query('SELECT id FROM divisions WHERE name = ?', [divisionName]);
            const [dists] = await connection.query('SELECT id FROM districts WHERE name = ?', [districtName]);

            if (divs.length === 0) {
                skippedRows.push({ row: rowNum, error: `Division "${divisionName}" not found in database` });
                continue;
            }
            if (dists.length === 0) {
                skippedRows.push({ row: rowNum, error: `District "${districtName}" not found in database` });
                continue;
            }

            const divisionId = divs[0].id;
            const districtId = dists[0].id;

            // Generate unique identifiers based on District and Constituency_No
            // Example: "Dhaka-1" -> "dhaka1"
            const username = `${districtName.replace(/\s+/g, '')}${constituencyNo}`;
            const slug = username.toLowerCase();

            // 2. Upsert User & Candidate
            const [existingCandidate] = await connection.query(
                'SELECT id, user_id FROM candidates WHERE district_id = ? AND constituency_no = ?',
                [districtId, constituencyNo]
            );

            let userId;

            if (existingCandidate.length === 0) {
                // NEW CANDIDATE: Check if user exists by username anyway
                const [existingUser] = await connection.query('SELECT id FROM users WHERE username = ?', [username]);

                if (existingUser.length === 0) {
                    const hashedPassword = await bcrypt.hash('Admin@123', 10);
                    const [userResult] = await connection.query(
                        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                        [username, hashedPassword, 'candidate']
                    );
                    userId = userResult.insertId;
                } else {
                    userId = existingUser[0].id;
                }

                // Insert new candidate profile
                await connection.query(
                    `INSERT INTO candidates (
                        user_id, slug, full_name_en, full_name_bn, division_id, district_id,
                        constituency_no, brief_intro, intro_bn, political_journey, political_journey_bn,
                        personal_profile, personal_profile_bn, vision, vision_bn,
                        facebook_link, responsible_person, email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId, slug, fullNameEn, fullNameBn, divisionId, districtId,
                        constituencyNo, briefIntro, introBn, politicalJourney, politicalJourneyBn,
                        personalProfile, personalProfileBn, vision, visionBn,
                        facebookLink, responsiblePerson, email
                    ]
                );
            } else {
                // EXISTING CANDIDATE: Update existing record
                const candidateId = existingCandidate[0].id;
                userId = existingCandidate[0].user_id;

                await connection.query(
                    `UPDATE candidates SET 
                        slug = ?, full_name_en = ?, full_name_bn = ?, division_id = ?, district_id = ?,
                        constituency_no = ?, brief_intro = ?, intro_bn = ?, political_journey = ?, political_journey_bn = ?,
                        personal_profile = ?, personal_profile_bn = ?, vision = ?, vision_bn = ?,
                        facebook_link = ?, responsible_person = ?, email = ?
                    WHERE id = ?`,
                    [
                        slug, fullNameEn, fullNameBn, divisionId, districtId,
                        constituencyNo, briefIntro, introBn, politicalJourney, politicalJourneyBn,
                        personalProfile, personalProfileBn, vision, visionBn,
                        facebookLink, responsiblePerson, email, candidateId
                    ]
                );

                // Ensure username stays in sync if District/No changed
                await connection.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
            }
            successCount++;
        }

        await connection.commit();
        res.json({
            message: 'Import process completed',
            summary: {
                totalRows: data.length,
                success: successCount,
                skipped: skippedRows.length,
                skippedDetails: skippedRows
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};
