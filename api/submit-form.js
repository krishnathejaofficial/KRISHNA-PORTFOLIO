import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import qrcode from 'qrcode';
import bwipjs from 'bwip-js';

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

// Auto-reply email template for submitters
function buildAutoReply(name, trackingId, source, meetingLink) {
  const sourceLabels = {
    collaboration: 'Collaboration Proposal',
    meeting: 'Meeting Request',
    hire: 'Job/Internship Application',
    'hire-krishna': 'Hiring Offer',
    contact: 'Message'
  };
  const label = sourceLabels[source] || 'Submission';
  const trackUrl = `https://krishnateja.vercel.app/?track=${trackingId}`;

  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eaeaea;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#111827 0%,#1f2937 100%);padding:36px 32px;text-align:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(212,175,55,0.15);border:2px solid #D4AF37;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:24px;">✅</span>
        </div>
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Received!</h1>
        <p style="color:#9ca3af;font-size:14px;margin:8px 0 0 0;">Your ${label} has been submitted</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px 0;">
          Hi <strong>${name}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
          Thank you for reaching out! I've received your <strong>${label}</strong> and will review it personally. 
          I aim to respond within <strong>24–48 hours</strong>.
        </p>

        ${source === 'meeting' && meetingLink ? `
        <!-- Meeting Video Call Card -->
        <div style="background:#f0f7ff;border-radius:12px;padding:20px;border:1px solid #bfdbfe;text-align:center;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#1e40af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🎥 Video Meeting Room</p>
          <p style="margin:0 0 16px 0;font-size:14px;color:#1e3a8a;">An automatic video call has been scheduled for your meeting:</p>
          <a href="${meetingLink}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:25px;text-decoration:none;font-weight:700;font-size:14px;box-shadow: 0 4px 10px rgba(37,99,235,0.15); border: none;">
            Join Video Call Now
          </a>
        </div>
        ` : ''}

        <!-- Tracking Card -->
        <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #eee;text-align:center;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your Tracking ID</p>
          <p style="margin:0 0 16px 0;font-size:28px;font-weight:800;color:#D4AF37;letter-spacing:4px;">${trackingId}</p>
          
          <div style="margin-bottom: 20px;">
            <p style="margin:0 0 8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Scan to Track</p>
            <img src="cid:qrcode" alt="QR Code" style="width:130px;height:130px;border:1px solid #ddd;padding:4px;background:white;display:inline-block;"/>
          </div>
          <div style="margin-bottom: 20px;">
            <p style="margin:0 0 8px 0;font-size:11px;color:#9ca3af;text-transform:uppercase;">Barcode</p>
            <img src="cid:barcode" alt="Barcode" style="height:40px;max-width:100%;display:inline-block;"/>
          </div>

          <a href="${trackUrl}" style="display:inline-block;background:#D4AF37;color:#111;padding:10px 24px;border-radius:25px;text-decoration:none;font-weight:700;font-size:14px;">
            Track Your Request →
          </a>
        </div>

        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
          You can use this tracking ID or scan the QR code at any time to check the status of your request on my portfolio website. 
          You'll also receive an email notification when I update the status.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">
          G. Krishna Teja · VIT University · Biotechnology & Business Professional<br/>
          <a href="https://krishnateja.vercel.app" style="color:#D4AF37;text-decoration:none;">krishnateja.vercel.app</a>
        </p>
      </div>
    </div>
  `;
}

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

    // Setup Meeting details if source is meeting
    let meetingLink = '';
    if (source === 'meeting') {
      const slugName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const roomName = `KrishnaMeet-${slugName}-${trackingId}`;
      meetingLink = `https://meet.jit.si/${roomName}`;
    }

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
        
        <!-- Codes Section -->
        <div style="margin-top:25px;padding:15px;background-color:#ffffff;border:1px solid #eee;border-radius:8px;text-align:center;">
          <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Scan to Track</p>
          <img src="cid:qrcode" alt="QR Code" style="width:120px;height:120px;border:1px solid #ddd;padding:2px;background:white;"/>
          <p style="margin:10px 0 5px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Barcode</p>
          <img src="cid:barcode" alt="Barcode" style="height:35px;max-width:100%;"/>
        </div>
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
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Video Meeting:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="${meetingLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">Join Jitsi Meet</a></td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Agenda / Notes:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
        
        <!-- Video Meeting Action Button -->
        <div style="text-align: center; margin: 20px 0;">
          <a href="${meetingLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(37,99,235,0.2);">
            🎥 Join Video Call (Jitsi Meet)
          </a>
        </div>

        <!-- Codes Section -->
        <div style="margin-top:25px;padding:15px;background-color:#ffffff;border:1px solid #eee;border-radius:8px;text-align:center;">
          <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Scan to Track</p>
          <img src="cid:qrcode" alt="QR Code" style="width:120px;height:120px;border:1px solid #ddd;padding:2px;background:white;"/>
          <p style="margin:10px 0 5px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Barcode</p>
          <img src="cid:barcode" alt="Barcode" style="height:35px;max-width:100%;"/>
        </div>
      `);
    } else if (source === 'hire') {
      subject = `💼 Job/Intern Application: ${type} - ${name} [${trackingId}]`;
      htmlContent = baseTemplate('Team Application Received', '#10b981', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Applicant:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${name} (<a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>)</td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Phone:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td></tr>` : ''}
          ${timeline ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Experience:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${timeline}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Role/Position:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><span style="background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${type}</span></td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Application Details & Resume:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
        
        <!-- Codes Section -->
        <div style="margin-top:25px;padding:15px;background-color:#ffffff;border:1px solid #eee;border-radius:8px;text-align:center;">
          <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Scan to Track</p>
          <img src="cid:qrcode" alt="QR Code" style="width:120px;height:120px;border:1px solid #ddd;padding:2px;background:white;"/>
          <p style="margin:10px 0 5px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Barcode</p>
          <img src="cid:barcode" alt="Barcode" style="height:35px;max-width:100%;"/>
        </div>
      `);
    } else if (source === 'hire-krishna') {
      subject = `🏢 Hiring Offer: ${type} - ${name} [${trackingId}]`;
      htmlContent = baseTemplate('Hiring Offer Received', '#f59e0b', `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Company:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${name}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Contact Email:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Phone:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td></tr>` : ''}
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong><span style="color: #4b5563;">Role Offered:</span></strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><span style="background-color: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${type}</span></td></tr>
        </table>
        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 10px 0;">Offer Details:</h3>
        <p style="color: #374151; line-height: 1.7; white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 0;">${detail}</p>
        
        <!-- Codes Section -->
        <div style="margin-top:25px;padding:15px;background-color:#ffffff;border:1px solid #eee;border-radius:8px;text-align:center;">
          <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Scan to Track</p>
          <img src="cid:qrcode" alt="QR Code" style="width:120px;height:120px;border:1px solid #ddd;padding:2px;background:white;"/>
          <p style="margin:10px 0 5px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Barcode</p>
          <img src="cid:barcode" alt="Barcode" style="height:35px;max-width:100%;"/>
        </div>
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
        
        <!-- Codes Section -->
        <div style="margin-top:25px;padding:15px;background-color:#ffffff;border:1px solid #eee;border-radius:8px;text-align:center;">
          <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Scan to Track</p>
          <img src="cid:qrcode" alt="QR Code" style="width:120px;height:120px;border:1px solid #ddd;padding:2px;background:white;"/>
          <p style="margin:10px 0 5px 0;font-size:12px;color:#6b7280;text-transform:uppercase;">Barcode</p>
          <img src="cid:barcode" alt="Barcode" style="height:35px;max-width:100%;"/>
        </div>
      `);
    }

    // Generate QR & Barcode image buffers for email attachments
    const trackingUrl = `https://krishnateja.vercel.app/?track=${trackingId}`;
    const qrBuffer = await qrcode.toBuffer(trackingUrl, { width: 300, margin: 2 });
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: trackingId,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });

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
        meetingLink: source === 'meeting' ? meetingLink : '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Log activity
      await db.collection('activity_log').insertOne({
        action: 'new_submission',
        trackingId,
        source: source || 'contact',
        name,
        email,
        timestamp: new Date()
      });
    } catch (dbErr) {
      console.error('MongoDB Error:', dbErr);
    }

    // Send notification email to admin
    await transporter.sendMail({
      from: `"Portfolio Contact" <${DESTINATION_EMAIL}>`,
      to: DESTINATION_EMAIL,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `qr-${trackingId}.png`,
          content: qrBuffer,
          cid: 'qrcode'
        },
        {
          filename: `barcode-${trackingId}.png`,
          content: barcodeBuffer,
          cid: 'barcode'
        }
      ]
    });

    // Send auto-reply to the submitter
    try {
      await transporter.sendMail({
        from: `"G. Krishna Teja" <${DESTINATION_EMAIL}>`,
        to: email,
        subject: `✅ Received! Your ${source === 'meeting' ? 'Meeting Request' : source === 'collaboration' ? 'Collaboration Proposal' : 'Message'} [${trackingId}]`,
        html: buildAutoReply(name, trackingId, source, meetingLink),
        attachments: [
          {
            filename: `qr-${trackingId}.png`,
            content: qrBuffer,
            cid: 'qrcode'
          },
          {
            filename: `barcode-${trackingId}.png`,
            content: barcodeBuffer,
            cid: 'barcode'
          }
        ]
      });
    } catch (replyErr) {
      console.error('Auto-reply error (non-critical):', replyErr);
    }

    return res.status(200).json({ success: true, trackingId, meetingLink: source === 'meeting' ? meetingLink : undefined });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}
