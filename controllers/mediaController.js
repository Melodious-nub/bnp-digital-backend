const db = require('../config/db');

/**
 * @openapi
 * /api/media/gallery:
 *   post:
 *     summary: Bulk upload to gallery
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [image, video] }
 *               files: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Gallery updated
 */
exports.uploadGalleryFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body;
        const files = req.files;

        if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

        const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
        if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const candidateId = candidate[0].id;
        const values = files.map(file => [candidateId, `/uploads/${file.filename}`, type]);

        await db.query('INSERT INTO media_gallery (candidate_id, file_url, file_type) VALUES ?', [values]);

        res.json({ message: 'Gallery updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/media/gallery/{id}:
 *   delete:
 *     summary: Delete gallery item
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item deleted
 */
exports.deleteGalleryItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const [candidate] = await db.query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
        if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const itemId = req.params.id;
        await db.query('DELETE FROM media_gallery WHERE id = ? AND candidate_id = ?', [itemId, candidate[0].id]);
        res.json({ message: 'Gallery item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/media/gallery/admin:
 *   post:
 *     summary: (Private) Admin bulk upload to gallery for any candidate
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               candidateSlug: { type: string }
 *               type: { type: string, enum: [image, video] }
 *               files: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Gallery updated
 */
exports.uploadCandidateGalleryAdmin = async (req, res) => {
    try {
        const { candidateSlug, type } = req.body;
        const files = req.files;

        if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
        if (!candidateSlug) return res.status(400).json({ message: 'candidateSlug is required' });

        const [candidate] = await db.query('SELECT id FROM candidates WHERE slug = ?', [candidateSlug]);
        if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const candidateId = candidate[0].id;
        const values = files.map(file => [candidateId, `/uploads/${file.filename}`, type]);

        await db.query('INSERT INTO media_gallery (candidate_id, file_url, file_type) VALUES ?', [values]);

        res.json({ message: 'Gallery updated successfully by admin' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/media/profile-photo/{slug}:
 *   post:
 *     summary: (Private) Update candidate profile photo by slug (Admin Only)
 *     tags: [Media]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile photo updated
 *       404:
 *         description: Candidate not found
 */
exports.updateCandidateProfilePhoto = async (req, res) => {
    try {
        const { slug } = req.params;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const [candidate] = await db.query('SELECT id FROM candidates WHERE slug = ?', [slug]);
        if (candidate.length === 0) return res.status(404).json({ message: 'Candidate not found' });

        const photoUrl = `/uploads/${file.filename}`;
        await db.query('UPDATE candidates SET photo_url = ? WHERE slug = ?', [photoUrl, slug]);

        res.json({ message: 'Profile photo updated successfully', photoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
