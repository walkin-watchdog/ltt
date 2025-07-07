import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Received partnership request:', req.body);
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose mail
    const mailOptions = {
      from: `"LTT Partnership" <${process.env.SMTP_USER}>`,
      to: process.env.PARTNERSHIP_EMAIL, // Email stored in .env
      subject: 'New Partnership Request',
      html: `
        <h3>New Partnership Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Your partnership request has been sent.' });
  } catch (error) {
    console.error('Partnership mail error:', error);
    res.status(500).json({ error: 'Failed to send partnership request.' });
  }
});

export default router;