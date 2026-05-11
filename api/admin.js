import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
const RESEND_API_KEY = 're_5cTHKvba_3NR8u9NnnBvu9qc6V7NCwvMT';
const ADMIN_EMAIL = 'krishnatejareddy2001@gmail.com'; 
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

      // Send OTP via Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Admin Security <onboarding@resend.dev>',
          to: ADMIN_EMAIL,
          subject: `Admin Login OTP: ${generatedOtp}`,
          html: `<p>Your admin login OTP is: <strong>${generatedOtp}</strong>. It expires in 10 minutes.</p>`
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
