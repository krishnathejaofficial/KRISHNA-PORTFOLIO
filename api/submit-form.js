import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

// Vercel serverless function for Form Submission & Email via Nodemailer
const DESTINATION_EMAIL = 'krishnatejareddy2003@gmail.com'; 
const GMAIL_APP_PASSWORD = 'kqdvnpdqtneakjjr';
const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: DESTINATION_EMAIL,
    pass: GMAIL_APP_PASSWORD
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, name, email, phone, org, timeline, duration, detail, message, source } = req.body;

  try {
    // Generate a unique 6-digit Tracking ID
    const trackingId = `KT-${Math.floor(100000 + Math.random() * 900000)}`;

    let subject = '';
    let htmlContent = '';

    const baseTemplate = (title, accentColor, innerContent) => `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 700;">${title}</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px; letter-spacing: 1px;">TRACKING ID: <strong style="color: ${accentColor}; background: ${accentColor}15; padding: 4px 10px; border-radius: 20px;">${trackingId}</strong></p>
        </div>
        
        <div style="background-color: #fcfcfc; padding: 25px; border-radius: 12px; border-left: 5px solid ${accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          ${innerContent}
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #eaeaea; padding-top: 20px;">
          <p style="margin: 0;">This is an automated notification from Krishna's Portfolio.</p>
          <p style="margin: 5px 0 0 0;">Powered by Nodemailer & MongoDB</p>
        </div>
      </div>
    `;

    if (source === 'collaboration') {
      subject = `🚀 New Collab Proposal: ${type} - ${name} [${trackingId}]`;
      htmlContent = baseTemplate('Collaboration Proposal', '#D4AF37', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">From:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${name} (<a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>)</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Type:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><span style="background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${type}</span></td></tr>
          ${org ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Organization:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${org}</td></tr>` : ''}
          ${timeline ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Timeline:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${timeline}</td></tr>` : ''}
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Proposal Details:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
      `);
    } else if (source === 'meeting') {
      subject = `📅 Meeting Booked: ${type} - ${name} [${trackingId}]`;
      htmlContent = baseTemplate('Meeting Scheduled', '#3b82f6', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">With:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${name} (<a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>)</td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Phone:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td></tr>` : ''}
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Purpose:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${type}</span></td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Time (IST):</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><strong>${timeline}</strong></td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Duration:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><strong>${duration || 30} minutes</strong></td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Agenda / Notes:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
      `);
    } else if (source === 'hire') {
      subject = `💼 Quick Hire Inquiry: ${type} [${trackingId}]`;
      htmlContent = baseTemplate('Hiring Inquiry', '#10b981', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Recruiter Email:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Role/Position:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><span style="background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${type}</span></td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Additional Context:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
      `);
    } else {
      // Standard Contact Form
      subject = `✉️ New Message from ${name} [${trackingId}]`;
      htmlContent = baseTemplate('New Message Received', '#8b5cf6', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">From:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${name} (<a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>)</td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Message Content:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${message}</p>
      `);
    }

    // Save to MongoDB
    try {
      const client = await connectToDatabase();
      const db = client.db('trackingDB');
      await db.collection('submissions').insertOne({
        trackingId,
        source,
        type,
        name,
        email,
        phone: phone || '',
        org: org || '',
        timeline: timeline || '',
        duration: duration || (source === 'meeting' ? 30 : null),
        detail: detail || '',
        message: message || '',
        adminNote: '',
        status: 'Pending Review',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (dbErr) {
      console.error('MongoDB Error:', dbErr);
    }

    // Send email to admin via Nodemailer
    await transporter.sendMail({
      from: `"Portfolio Contact" <${DESTINATION_EMAIL}>`,
      to: DESTINATION_EMAIL,
      subject: subject,
      html: htmlContent
    });

    return res.status(200).json({ success: true, trackingId });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}
