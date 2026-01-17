const db = require('../config/db');

/**
 * @openapi
 * /api/locations/divisions:
 *   get:
 *     tags: [Locations]
 *     summary: Get all divisions
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
 */
exports.getDivisions = async (req, res) => {
    try {
        const [divisions] = await db.query('SELECT * FROM divisions');
        res.json(divisions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching divisions' });
    }
};

/**
 * @openapi
 * /api/locations/districts/{divisionId}:
 *   get:
 *     tags: [Locations]
 *     summary: Get districts by division ID
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of districts
 */
exports.getDistricts = async (req, res) => {
    try {
        const { divisionId } = req.params;
        const [districts] = await db.query('SELECT * FROM districts WHERE division_id = ?', [divisionId]);
        res.json(districts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching districts' });
    }
};
