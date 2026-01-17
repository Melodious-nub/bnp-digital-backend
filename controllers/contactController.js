const db = require('../config/db');
const nodemailer = require('nodemailer');

// Configure nodemailer with dummy SMTP (will be replaced with real SMTP later)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'dummy@example.com',
        pass: process.env.SMTP_PASS || 'dummypassword'
    }
});

/**
 * @openapi
 * /api/contact/submit:
 *   post:
 *     summary: (Public) Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message, slugName]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *               slugName: { type: string }
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message, slugName } = req.body;

        if (!name || !email || !subject || !message || !slugName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Save to database
        await db.query(
            'INSERT INTO contact_messages (candidate_slug, name, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [slugName, name, email, subject, message]
        );

        // Get candidate email
        const [candidate] = await db.query(
            'SELECT email, full_name_en, full_name_bn FROM candidates WHERE slug = ?',
            [slugName]
        );

        // Send email if candidate has email
        if (candidate.length > 0 && candidate[0].email) {
            const candidateName = candidate[0].full_name_bn || candidate[0].full_name_en;
            const candidateEmail = candidate[0].email;

            const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #006747 0%, #008856 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #006747; }
        .label { font-weight: bold; color: #006747; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Contact Message</h1>
            <p>You have received a new message from your profile</p>
        </div>
        <div class="content">
            <div class="info-box">
                <p><span class="label">To:</span> ${candidateName}</p>
                <p><span class="label">Candidate Profile:</span> ${slugName}</p>
            </div>
            
            <h3 style="color: #006747;">Message Details:</h3>
            
            <div class="info-box">
                <p><span class="label">From:</span> ${name}</p>
                <p><span class="label">Email:</span> ${email}</p>
                <p><span class="label">Subject:</span> ${subject}</p>
            </div>
            
            <div class="info-box">
                <p><span class="label">Message:</span></p>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666;">
                <em>This message was sent through your BNP Digital Platform profile contact form.</em>
            </p>
        </div>
        <div class="footer">
            <p>BNP Digital Platform | Automated Message</p>
            <p>Please do not reply to this email directly. Contact the sender at: ${email}</p>
        </div>
    </div>
</body>
</html>
            `;

            try {
                await transporter.sendMail({
                    from: `"BNP Digital Platform" <${process.env.SMTP_USER || 'noreply@bnp.org'}>`,
                    to: candidateEmail,
                    subject: `New Contact Message: ${subject}`,
                    html: emailTemplate
                });
            } catch (emailError) {
                console.error('Email sending failed (using dummy SMTP):', emailError.message);
                // Don't fail the request if email fails
            }
        }

        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/contact/messages:
 *   get:
 *     summary: (Private) Get all contact messages (Super Admin)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [unread, read, all] }
 *       - in: query
 *         name: slug
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of contact messages
 */
exports.getAllMessages = async (req, res) => {
    try {
        const { status, slug } = req.query;

        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (slug) {
            query += ' AND candidate_slug = ?';
            params.push(slug);
        }

        query += ' ORDER BY created_at DESC';

        const [messages] = await db.query(query, params);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/contact/my-messages:
 *   get:
 *     summary: (Private) Get messages for logged-in candidate
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [unread, read, all] }
 *     responses:
 *       200:
 *         description: List of messages for this candidate
 */
exports.getMyMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        // Get candidate slug
        const [candidate] = await db.query('SELECT slug FROM candidates WHERE user_id = ?', [userId]);
        if (candidate.length === 0) {
            return res.status(404).json({ message: 'Candidate profile not found' });
        }

        const slug = candidate[0].slug;

        let query = 'SELECT * FROM contact_messages WHERE candidate_slug = ?';
        const params = [slug];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [messages] = await db.query(query, params);
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @openapi
 * /api/contact/messages/{id}/mark-read:
 *   put:
 *     summary: (Private) Mark message as read
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Message marked as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const messageId = req.params.id;
        await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', ['read', messageId]);
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
