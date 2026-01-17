const db = require('../config/db');
const formatUrl = require('../utils/formatUrl');

/**
 * @openapi
 * /api/candidates/by-district:
 *   get:
 *     summary: (Public) Get candidates by district name
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: districtName
 *         schema: { type: string }
 *         required: true
 *         description: Name of the district (English or Bengali)
 *     responses:
 *       200:
 *         description: List of candidates in the district
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 */
exports.getCandidatesByDistrict = async (req, res) => {
    try {
        const { districtName } = req.query;

        const [rows] = await db.query(
            `SELECT c.*, d.bn_name as district_bn, dv.bn_name as division_bn
             FROM candidates c
             JOIN districts d ON c.district_id = d.id
             JOIN divisions dv ON c.division_id = dv.id
             WHERE d.name = ? OR d.bn_name = ?`,
            [districtName, districtName]
        );

        // Map results to match frontend expectations
        const result = rows.map(row => ({
            id: row.id,
            fullNameEn: row.full_name_en,
            fullNameBn: row.full_name_bn,
            photoUrl: formatUrl(row.photo_url),
            designation: row.designation,
            slug: row.slug,
            districtBn: row.district_bn,
            divisionBn: row.division_bn,
            constituencyNo: row.constituency_no
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/candidates/profile/{slug}:
 *   get:
 *     summary: (Public) Get candidate profile by slug
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique slug of the candidate
 *     responses:
 *       200:
 *         description: Candidate profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateProfile'
 *       404:
 *         description: Candidate not found
 */
exports.getCandidateProfile = async (req, res) => {
    try {
        const { slug } = req.params;

        const [rows] = await db.query(
            `SELECT c.*, d.bn_name as district_bn, d.name as district_en, dv.bn_name as division_bn, dv.name as division_en
             FROM candidates c
             JOIN districts d ON c.district_id = d.id
             JOIN divisions dv ON c.division_id = dv.id
             WHERE c.slug = ?`,
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const candidate = rows[0];

        // Fetch team members
        const [team] = await db.query('SELECT * FROM team_members WHERE candidate_id = ?', [candidate.id]);

        // Fetch gallery
        const [gallery] = await db.query('SELECT * FROM media_gallery WHERE candidate_id = ?', [candidate.id]);

        res.json({
            id: candidate.id,
            fullNameEn: candidate.full_name_en,
            fullNameBn: candidate.full_name_bn,
            slug: candidate.slug,
            divisionId: candidate.division_id,
            districtId: candidate.district_id,
            constituencyNo: candidate.constituency_no,
            photoUrl: formatUrl(candidate.photo_url),
            designation: candidate.designation,
            briefIntro: candidate.brief_intro,
            introBn: candidate.intro_bn,
            politicalJourney: candidate.political_journey,
            politicalJourneyBn: candidate.political_journey_bn,
            personalProfile: candidate.personal_profile,
            personalProfileBn: candidate.personal_profile_bn,
            vision: candidate.vision,
            visionBn: candidate.vision_bn,
            facebookLink: candidate.facebook_link,
            responsiblePerson: candidate.responsible_person,
            email: candidate.email,
            districtBn: candidate.district_bn,
            districtEn: candidate.district_en,
            divisionBn: candidate.division_bn,
            divisionEn: candidate.division_en,
            team: team.map(t => ({
                id: t.id,
                name: t.name,
                role: t.role,
                photoUrl: formatUrl(t.photo_url),
                facebookLink: t.facebook_link,
                linkedinLink: t.linkedin_link
            })),
            gallery: gallery.map(m => ({
                id: m.id,
                fileUrl: formatUrl(m.file_url),
                fileType: m.file_type,
                createdAt: m.created_at
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/candidates/{slug}:
 *   put:
 *     summary: (Private) Update candidate profile (Superadmin Only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name_en: { type: string }
 *               full_name_bn: { type: string }
 *               photo_url: { type: string }
 *               designation: { type: string }
 *               brief_intro: { type: string }
 *               intro_bn: { type: string }
 *               political_journey: { type: string }
 *               political_journey_bn: { type: string }
 *               personal_profile: { type: string }
 *               personal_profile_bn: { type: string }
 *               vision: { type: string }
 *               vision_bn: { type: string }
 *               facebook_link: { type: string }
 *               responsible_person: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       404:
 *         description: Candidate not found
 */
exports.updateCandidate = async (req, res) => {
    try {
        const { slug } = req.params;
        const updates = req.body;

        const [existing] = await db.query('SELECT id FROM candidates WHERE slug = ?', [slug]);
        if (existing.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const candidateId = existing[0].id;

        const allowedFields = [
            'full_name_en', 'full_name_bn', 'slug', 'division_id', 'district_id',
            'constituency_no', 'designation', 'brief_intro', 'intro_bn',
            'political_journey', 'political_journey_bn', 'personal_profile',
            'personal_profile_bn', 'vision', 'vision_bn', 'facebook_link',
            'responsible_person', 'email', 'photo_url'
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const query = 'UPDATE candidates SET ' + Object.keys(updateData).map(key => `${key} = ?`).join(', ') + ' WHERE id = ?';
        const values = [...Object.values(updateData), candidateId];

        await db.query(query, values);
        res.json({ message: 'Candidate updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
