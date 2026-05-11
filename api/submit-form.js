import { MongoClient } from 'mongodb';

// Vercel serverless function for Form Submission & Email via Resend
const RESEND_API_KEY = 're_5cTHKvba_3NR8u9NnnBvu9qc6V7NCwvMT';
const DESTINATION_EMAIL = 'krishnatejareddy2001@gmail.com'; // Change to 2003 if preferred
const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, name, email, org, timeline, detail, message, source } = req.body;

  try {
    // Generate a unique 6-digit Tracking ID
    const trackingId = `KT-${Math.floor(100000 + Math.random() * 900000)}`;

    let subject = '';
    let htmlContent = '';

    if (source === 'collaboration') {
      subject = `🚀 New Collab: ${type} - ${name} [${trackingId}]`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #111827; margin: 0;">New Collaboration Proposal</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Tracking ID: <strong>${trackingId}</strong></p>
          </div>
          
          <div style="background-color: white; padding: 24px; border-radius: 8px; border-left: 4px solid #D4AF37; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 12px 0;"><strong><span style="color: #4b5563;">From:</span></strong> ${name} (<a href="mailto:${email}" style="color: #2563eb;">${email}</a>)</p>
            <p style="margin: 0 0 12px 0;"><strong><span style="color: #4b5563;">Type:</span></strong> <span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 13px; font-weight: 500;">${type}</span></p>
            ${org ? `<p style="margin: 0 0 12px 0;"><strong><span style="color: #4b5563;">Organization:</span></strong> ${org}</p>` : ''}
            ${timeline ? `<p style="margin: 0 0 12px 0;"><strong><span style="color: #4b5563;">Timeline:</span></strong> ${timeline}</p>` : ''}
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            
            <h3 style="color: #111827; font-size: 15px; margin-top: 0;">Proposal Details:</h3>
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap; background-color: #f9fafb; padding: 12px; border-radius: 6px;">${detail}</p>
          </div>
          
          <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
            <p>This email was sent automatically from your portfolio website via Resend.</p>
          </div>
        </div>
      `;
    } else {
      // Standard Contact Form
      subject = `✉️ New Message from ${name} [${trackingId}]`;
      htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #111827; margin: 0;">New Message Received</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Tracking ID: <strong>${trackingId}</strong></p>
          </div>
          
          <div style="background-color: white; padding: 24px; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 12px 0;"><strong><span style="color: #4b5563;">From:</span></strong> ${name} (<a href="mailto:${email}" style="color: #2563eb;">${email}</a>)</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            
            <h3 style="color: #111827; font-size: 15px; margin-top: 0;">Message:</h3>
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap; background-color: #f9fafb; padding: 12px; border-radius: 6px;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
            <p>This email was sent automatically from your portfolio website via Resend.</p>
          </div>
        </div>
      `;
    }

    // Save to MongoDB
    try {
      const client = await connectToDatabase();
      const db = client.db('trackingDB');
      await db.collection('submissions').insertOne({
        trackingId,
        source, // 'collaboration' or 'contact'
        type,
        name,
        email,
        org,
        timeline,
        detail,
        message,
        status: 'Pending Review',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (dbErr) {
      console.error('MongoDB Error:', dbErr);
      // We continue to send the email even if DB fails, to ensure no messages are lost.
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>', // Resend trial requires this from address
        to: DESTINATION_EMAIL,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend API error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    
    // We haven't hooked up MongoDB yet, but we will return the trackingId to the user.
    return res.status(200).json({ success: true, trackingId, data });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}
