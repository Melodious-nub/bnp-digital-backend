const db = require('../config/db');
const formatUrl = require('../utils/formatUrl');

/**
 * @openapi
 * /api/team/public:
 *   get:
 *     summary: (Public) Get global team members (Main Portal)
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: List of global team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 */
exports.getPublicGlobalTeam = async (req, res) => {
    try {
        const [members] = await db.query('SELECT * FROM team_members WHERE candidate_id IS NULL');
        res.json(members.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            photoUrl: formatUrl(t.photo_url),
            facebookLink: t.facebook_link,
            linkedinLink: t.linkedin_link
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/team/public/{slug}:
 *   get:
 *     summary: (Public) Get team members by candidate slug
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of candidate team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 */
exports.getPublicTeamByCandidateSlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [candidate] = await db.query('SELECT id FROM candidates WHERE slug = ?', [slug]);
        if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const [members] = await db.query('SELECT * FROM team_members WHERE candidate_id = ?', [candidate[0].id]);
        res.json(members.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            photoUrl: formatUrl(t.photo_url),
            facebookLink: t.facebook_link,
            linkedinLink: t.linkedin_link
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/team:
 *   get:
 *     summary: (Private) Get team members (Session Context)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team members (Global if Super Admin, Candidate Specific if Candidate)
 */
exports.getTeamMembers = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        let query = 'SELECT * FROM team_members WHERE candidate_id ';
        let params = [];

        if (role === 'super_admin') {
            query += 'IS NULL';
        } else {
            const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
            if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
            query += '= ?';
            params.push(candidate[0].id);
        }

        const [members] = await db.query(query, params);
        res.json(members.map(t => ({
            id: t.id,
            name: t.name,
            role: t.role,
            photoUrl: formatUrl(t.photo_url),
            facebookLink: t.facebook_link,
            linkedinLink: t.linkedin_link
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/team:
 *   post:
 *     summary: (Private) Add team member (Session Context)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               facebookLink: { type: string }
 *               linkedinLink: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Team member added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 memberId: { type: integer }
 */
exports.addTeamMember = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        let candidateId = null;

        if (role !== 'super_admin') {
            const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
            if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
            candidateId = candidate[0].id;
        }

        const { name, role: memberRole, facebookLink, linkedinLink } = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.query(
            'INSERT INTO team_members (candidate_id, name, role, photo_url, facebook_link, linkedin_link) VALUES (?, ?, ?, ?, ?, ?)',
            [candidateId, name, memberRole, photoUrl, facebookLink, linkedinLink]
        );

        res.status(201).json({ message: 'Team member added', memberId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/team/{id}:
 *   put:
 *     summary: (Private) Update team member (Session Context)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               role: { type: string }
 *               facebookLink: { type: string }
 *               linkedinLink: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Successfully updated
 */
exports.updateTeamMember = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const memberId = req.params.id;
        const updates = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        let checkQuery = 'SELECT * FROM team_members WHERE id = ?';
        let checkParams = [memberId];

        if (role === 'super_admin') {
            checkQuery += ' AND candidate_id IS NULL';
        } else {
            const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
            if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
            checkQuery += ' AND candidate_id = ?';
            checkParams.push(candidate[0].id);
        }

        const [existing] = await db.query(checkQuery, checkParams);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Team member not found or access denied' });
        }

        let query = 'UPDATE team_members SET ';
        const params = [];
        const fields = {
            name: 'name',
            role: 'role',
            facebookLink: 'facebook_link',
            linkedinLink: 'linkedin_link'
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

        if (params.length === 0) {
            return res.json({ message: 'No changes provided' });
        }

        query = query.slice(0, -2); // Remove trailing comma and space
        query += ' WHERE id = ?';
        params.push(memberId);

        await db.query(query, params);
        res.json({ message: 'Team member updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/team/{id}:
 *   delete:
 *     summary: (Private) Delete team member (Check Permissions)
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
exports.deleteTeamMember = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const memberId = req.params.id;

        if (role === 'super_admin') {
            await db.query('DELETE FROM team_members WHERE id = ? AND candidate_id IS NULL', [memberId]);
        } else {
            const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
            if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });
            await db.query('DELETE FROM team_members WHERE id = ? AND candidate_id = ?', [memberId, candidate[0].id]);
        }

        res.json({ message: 'Team member deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
