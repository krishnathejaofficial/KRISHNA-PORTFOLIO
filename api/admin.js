import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
const RESEND_API_KEY = 're_5cTHKvba_3NR8u9NnnBvu9qc6V7NCwvMT';
const ADMIN_EMAIL = 'krishnatejareddy2003@gmail.com'; 
const ADMIN_PASSWORD = 'admin'; // Basic password for first layer

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, password, otp, token, trackingId, newStatus } = req.body;

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');

    // 1. Request OTP
    if (action === 'request-otp') {
      if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid password' });
      
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP to DB with a 10-minute expiry
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { otp: generatedOtp, otpExpiry: Date.now() + 10 * 60 * 1000 } },
        { upsert: true }
      );

      const otpTemplate = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center;">
        <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 700;">Admin Authentication</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">A login attempt was made to your portfolio dashboard.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #fcfcfc; border-radius: 12px; border: 2px dashed #D4AF37;">
          <p style="margin: 0; color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your One-Time Password</p>
          <strong style="font-size: 36px; color: #111827; letter-spacing: 5px;">${generatedOtp}</strong>
        </div>
        
        <p style="color: #ef4444; font-size: 12px; font-weight: 600;">This code expires in 10 minutes.</p>
      </div>
      `;

      // Send OTP via Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Admin Security <onboarding@resend.dev>',
          to: ADMIN_EMAIL,
          subject: `🔐 Admin Login OTP: ${generatedOtp}`,
          html: otpTemplate
        })
      });

      return res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    }

    // 2. Verify OTP
    if (action === 'verify-otp') {
      const adminDoc = await db.collection('auth').findOne({ role: 'admin' });
      if (!adminDoc || !adminDoc.otp || adminDoc.otp !== otp || Date.now() > adminDoc.otpExpiry) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }

      // Generate a session token
      const sessionToken = `session_${Math.random().toString(36).substring(2, 15)}`;
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { sessionToken, sessionExpiry: Date.now() + 24 * 60 * 60 * 1000 }, $unset: { otp: "", otpExpiry: "" } }
      );

      return res.status(200).json({ success: true, token: sessionToken });
    }

    // --- Protected Routes Below ---
    const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
    if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
      return res.status(401).json({ error: 'Unauthorized or session expired. Please login again.' });
    }

    // 3. Get all submissions
    if (action === 'get-submissions') {
      const submissions = await db.collection('submissions').find().sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, data: submissions });
    }

    // 4. Update status
    if (action === 'update-status') {
      if (!trackingId || !newStatus) return res.status(400).json({ error: 'Missing parameters' });
      
      await db.collection('submissions').updateOne(
        { trackingId },
        { $set: { status: newStatus, updatedAt: new Date() } }
      );
      
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
