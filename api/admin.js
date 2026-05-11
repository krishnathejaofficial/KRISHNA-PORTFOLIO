import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
const ADMIN_EMAIL = 'krishnatejareddy2003@gmail.com';
const DEFAULT_PASSWORD = 'admin';
const GMAIL_APP_PASSWORD = 'kqdvnpdqtneakjjr';

let cachedClient = null;
async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

function generateAllSlots() {
  const slots = [];
  for (let h = 8; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push(`${String(hour12).padStart(2,'0')}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return slots;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ADMIN_EMAIL,
    pass: GMAIL_APP_PASSWORD
  }
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Krishna's Portfolio" <${ADMIN_EMAIL}>`,
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    console.error('Nodemailer error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, password, currentPassword, newPassword, otp, token, trackingId, newStatus, adminNote, reminderTime } = req.body;

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');

    // ── AUTH ──────────────────────────────────────────────────────────────────
    if (action === 'request-otp') {
      const authDoc = await db.collection('auth').findOne({ role: 'admin' });
      const activePassword = authDoc?.password || DEFAULT_PASSWORD;

      if (password !== activePassword) return res.status(401).json({ error: 'Invalid password' });
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { otp: generatedOtp, otpExpiry: Date.now() + 10 * 60 * 1000 } },
        { upsert: true }
      );
      const html = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;text-align:center;border-radius:16px;border:1px solid #eaeaea;">
        <h1 style="color:#111827;font-size:24px;font-weight:700;">Admin Authentication</h1>
        <p style="color:#6b7280;font-size:14px;">A login attempt was made to your portfolio dashboard.</p>
        <div style="margin:30px 0;padding:20px;border-radius:12px;border:2px dashed #D4AF37;">
          <p style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Your OTP</p>
          <strong style="font-size:36px;color:#111827;letter-spacing:5px;">${generatedOtp}</strong>
        </div>
        <p style="color:#ef4444;font-size:12px;font-weight:600;">Expires in 10 minutes.</p>
      </div>`;
      await sendEmail(ADMIN_EMAIL, `🔐 Admin Login OTP: ${generatedOtp}`, html);
      return res.status(200).json({ success: true });
    }

    if (action === 'verify-otp') {
      const adminDoc = await db.collection('auth').findOne({ role: 'admin' });
      if (!adminDoc || adminDoc.otp !== otp || Date.now() > adminDoc.otpExpiry)
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      const sessionToken = `session_${Math.random().toString(36).substring(2, 15)}`;
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { sessionToken, sessionExpiry: Date.now() + 24 * 60 * 60 * 1000 }, $unset: { otp: '', otpExpiry: '' } }
      );
      return res.status(200).json({ success: true, token: sessionToken });
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
    if (action === 'request-forgot-password') {
      const { email } = req.body;
      if (email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Invalid admin email address' });
      
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { forgotPwdOtp: generatedOtp, forgotPwdOtpExpiry: Date.now() + 10 * 60 * 1000 } },
        { upsert: true }
      );
      
      const html = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;text-align:center;border-radius:16px;border:1px solid #eaeaea;">
        <h1 style="color:#111827;font-size:24px;font-weight:700;">Password Reset Request</h1>
        <p style="color:#6b7280;font-size:14px;">An attempt was made to reset your admin password.</p>
        <div style="margin:30px 0;padding:20px;border-radius:12px;border:2px dashed #D4AF37;">
          <p style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Verification OTP</p>
          <strong style="font-size:36px;color:#111827;letter-spacing:5px;">${generatedOtp}</strong>
        </div>
      </div>`;
      await sendEmail(ADMIN_EMAIL, `🔐 Password Reset OTP: ${generatedOtp}`, html);
      return res.status(200).json({ success: true });
    }

    if (action === 'reset-forgot-password') {
      const { otp, newPassword } = req.body;
      const adminDoc = await db.collection('auth').findOne({ role: 'admin' });
      if (!adminDoc || !adminDoc.forgotPwdOtp || adminDoc.forgotPwdOtp !== otp || Date.now() > adminDoc.forgotPwdOtpExpiry) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }
      
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { 
          $set: { password: newPassword },
          $unset: { forgotPwdOtp: '', forgotPwdOtpExpiry: '', sessionToken: '', sessionExpiry: '' }
        }
      );
      return res.status(200).json({ success: true });
    }

    // ── AUTH GUARD ────────────────────────────────────────────────────────────
    const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
    if (!adminDoc || Date.now() > adminDoc.sessionExpiry)
      return res.status(401).json({ error: 'Unauthorized or session expired.' });

    // ── PASSWORD CHANGE ───────────────────────────────────────────────────────
    if (action === 'request-password-change-otp') {
      const activePassword = adminDoc.password || DEFAULT_PASSWORD;
      if (currentPassword !== activePassword) return res.status(401).json({ error: 'Incorrect current password' });
      
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { $set: { changePwdOtp: generatedOtp, changePwdOtpExpiry: Date.now() + 10 * 60 * 1000, pendingNewPassword: newPassword } }
      );
      
      const html = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;text-align:center;border-radius:16px;border:1px solid #eaeaea;">
        <h1 style="color:#111827;font-size:24px;font-weight:700;">Password Change Request</h1>
        <p style="color:#6b7280;font-size:14px;">An attempt was made to change your admin password.</p>
        <div style="margin:30px 0;padding:20px;border-radius:12px;border:2px dashed #D4AF37;">
          <p style="color:#4b5563;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Verification OTP</p>
          <strong style="font-size:36px;color:#111827;letter-spacing:5px;">${generatedOtp}</strong>
        </div>
      </div>`;
      await sendEmail(ADMIN_EMAIL, `🔐 Password Change OTP: ${generatedOtp}`, html);
      return res.status(200).json({ success: true });
    }

    if (action === 'verify-password-change-otp') {
      if (!adminDoc.changePwdOtp || adminDoc.changePwdOtp !== otp || Date.now() > adminDoc.changePwdOtpExpiry) {
        return res.status(401).json({ error: 'Invalid or expired OTP for password change' });
      }
      
      await db.collection('auth').updateOne(
        { role: 'admin' },
        { 
          $set: { password: adminDoc.pendingNewPassword },
          $unset: { changePwdOtp: '', changePwdOtpExpiry: '', pendingNewPassword: '', sessionToken: '', sessionExpiry: '' }
        }
      );
      return res.status(200).json({ success: true });
    }

    // ── SUBMISSIONS ───────────────────────────────────────────────────────────
    if (action === 'get-submissions') {
      const submissions = await db.collection('submissions').find().sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, data: submissions });
    }

    if (action === 'update-status') {
      if (!trackingId || !newStatus) return res.status(400).json({ error: 'Missing parameters' });
      const submission = await db.collection('submissions').findOne({ trackingId });
      if (!submission) return res.status(404).json({ error: 'Submission not found' });

      await db.collection('submissions').updateOne(
        { trackingId },
        { $set: { status: newStatus, adminNote: adminNote || '', updatedAt: new Date() } }
      );

      const statusColor = newStatus === 'Accepted' ? '#10b981' : newStatus === 'Rejected' ? '#ef4444' : '#f59e0b';
      const noteBlock = adminNote ? `
        <div style="margin-top:20px;padding:15px;border-radius:8px;background:#f9fafb;border:1px solid #eee;text-align:left;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#4b5563;font-weight:600;">Note from Krishna:</p>
          <p style="margin:0;color:#374151;line-height:1.6;">${adminNote}</p>
        </div>` : '';
      const html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border-radius:16px;border:1px solid #eaeaea;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="color:#111827;margin:0;font-size:24px;">Update on your Request</h1>
          <p style="color:#6b7280;font-size:14px;margin-top:8px;">Tracking ID: <strong>${trackingId}</strong></p>
        </div>
        <div style="background:#fcfcfc;padding:25px;border-radius:12px;border-left:5px solid ${statusColor};text-align:center;">
          <p style="margin:0;color:#4b5563;font-size:16px;">Status updated to:</p>
          <h2 style="color:${statusColor};font-size:28px;margin:15px 0;">${newStatus}</h2>
          <p style="color:#6b7280;font-size:14px;margin:0;">Krishna Teja has reviewed your submission.</p>
          ${noteBlock}
        </div>
        <div style="text-align:center;margin-top:30px;font-size:12px;color:#9ca3af;">
          <p>Automated notification from krishna's Portfolio · Do not reply.</p>
        </div>
      </div>`;
      await sendEmail(submission.email, `${newStatus === 'Accepted' ? '✅' : newStatus === 'Rejected' ? '❌' : '🔄'} Status Update: ${newStatus} [${trackingId}]`, html);
      return res.status(200).json({ success: true });
    }

    if (action === 'delete-submission') {
      if (!trackingId) return res.status(400).json({ error: 'Missing trackingId' });
      await db.collection('submissions').deleteOne({ trackingId });
      return res.status(200).json({ success: true });
    }

    // ── CALENDAR / SLOTS ──────────────────────────────────────────────────────
    if (action === 'get-calendar-slots') {
      const { date } = req.body;
      const ALL_SLOTS = generateAllSlots();
      const blockedDoc = await db.collection('blocked_slots').findOne({ date });
      const slotData = blockedDoc?.slotData || {};
      if (blockedDoc?.times) blockedDoc.times.forEach(t => { if (!slotData[t]) slotData[t] = { blocked: true, note: '' }; });

      // Merge weekly recurring timetable for admin view
      const parsedDate = new Date(date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[parsedDate.getDay()];
      const weeklyDoc = await db.collection('weekly_timetable').findOne({ _id: 'default' });
      if (weeklyDoc && weeklyDoc[dayOfWeek]) {
        weeklyDoc[dayOfWeek].forEach(block => {
          const startIdx = ALL_SLOTS.indexOf(block.start);
          const endIdx = ALL_SLOTS.indexOf(block.end);
          if (startIdx !== -1 && endIdx !== -1) {
            for (let i = startIdx; i < endIdx; i++) {
              const slot = ALL_SLOTS[i];
              if (!slotData[slot]) {
                slotData[slot] = { blocked: true, note: `Weekly: ${block.label || 'Busy'}`, isWeekly: true };
              }
            }
          }
        });
      }

      const bookings = await db.collection('submissions').find({
        source: 'meeting', timeline: { $regex: `^${date}` }, status: { $nin: ['Rejected'] }
      }).toArray();

      const bookedMap = {};
      bookings.forEach(b => {
        const timePart = b.timeline.replace(`${date} at `, '').replace(' IST', '').trim();
        const dur = parseInt(b.duration) || 30;
        const slotsNeeded = Math.ceil(dur / 30);
        const startIdx = ALL_SLOTS.indexOf(timePart);
        for (let i = 0; i < slotsNeeded; i++) {
          if (startIdx + i < ALL_SLOTS.length) {
            bookedMap[ALL_SLOTS[startIdx + i]] = { trackingId: b.trackingId, name: b.name, purpose: b.type };
          }
        }
      });

      const result = ALL_SLOTS.map(slot => ({
        time: slot,
        isAdminBlocked: blockedDoc?.dayLocked || slotData[slot]?.blocked || false,
        note: slotData[slot]?.note || '',
        isBooked: !!bookedMap[slot],
        bookedBy: bookedMap[slot] || null,
        isWeekly: slotData[slot]?.isWeekly || false
      }));

      return res.status(200).json({ success: true, slots: result, dayLocked: blockedDoc?.dayLocked || false });
    }

    if (action === 'toggle-slot') {
      const { date, time, isBlocked, note } = req.body;
      const update = isBlocked
        ? { $set: { [`slotData.${time}`]: { blocked: true, note: note || '' } } }
        : { $unset: { [`slotData.${time}`]: '' } };
      await db.collection('blocked_slots').updateOne({ date }, { ...update, $set: { ...((isBlocked) ? { [`slotData.${time}`]: { blocked: true, note: note || '' } } : {}), date } }, { upsert: true });
      if (!isBlocked) {
        await db.collection('blocked_slots').updateOne({ date }, { $unset: { [`slotData.${time}`]: '' } });
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'set-slot') {
      const { date, time, blocked, note } = req.body;
      if (blocked) {
        await db.collection('blocked_slots').updateOne(
          { date },
          { $set: { date, [`slotData.${time}`]: { blocked: true, note: note || '' } } },
          { upsert: true }
        );
      } else {
        await db.collection('blocked_slots').updateOne(
          { date },
          { $unset: { [`slotData.${time}`]: '' }, $setOnInsert: { date } },
          { upsert: true }
        );
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'lock-day') {
      const { date, locked } = req.body;
      await db.collection('blocked_slots').updateOne(
        { date },
        { $set: { date, dayLocked: locked } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    if (action === 'set-reminder') {
      const { date, time, reminderText } = req.body;
      // Store dates in ISO format so they can be parsed for expiry checks later, but keep original for display if needed.
      // We will parse date/time to a Date object:
      const [year, month, day] = date.split('-');
      let [timeStr, modifier] = time.split(' ');
      let [hours, minutes] = timeStr.split(':');
      if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
      if (modifier === 'AM' && hours === '12') hours = '00';
      const reminderDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

      await db.collection('reminders').insertOne({
        date, time, reminderText, sent: false, createdAt: new Date(), reminderDate
      });
      const html = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;border-radius:16px;border:1px solid #eaeaea;">
        <h2 style="color:#111827;">⏰ Reminder Set</h2>
        <p>A reminder has been scheduled for <strong>${date} at ${time}</strong>.</p>
        <p style="background:#f9fafb;padding:12px;border-radius:8px;border-left:4px solid #D4AF37;">${reminderText}</p>
        <p style="color:#6b7280;font-size:12px;">Note: You will receive an email reminder 30 minutes before.</p>
      </div>`;
      await sendEmail(ADMIN_EMAIL, `⏰ Reminder: ${reminderText} on ${date} at ${time}`, html);
      return res.status(200).json({ success: true });
    }

    if (action === 'get-reminders') {
      const now = new Date();
      // Fetch only future reminders (not expired)
      const reminders = await db.collection('reminders').find({ 
        $or: [
          { reminderDate: { $gte: now } },
          { reminderDate: { $exists: false } } // For older ones where reminderDate wasn't set
        ] 
      }).sort({ reminderDate: 1, createdAt: 1 }).toArray();
      return res.status(200).json({ success: true, reminders });
    }

    if (action === 'delete-reminder') {
      const { id } = req.body;
      const { ObjectId } = require('mongodb');
      await db.collection('reminders').deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true });
    }

    // ── WEEKLY TIMETABLE ──────────────────────────────────────────────────────
    if (action === 'get-weekly-timetable') {
      const doc = await db.collection('weekly_timetable').findOne({ _id: 'default' });
      return res.status(200).json({ success: true, timetable: doc || {} });
    }

    if (action === 'add-weekly-block') {
      const { day, start, end, label } = req.body;
      const ALL_SLOTS = generateAllSlots();
      const newStartIdx = ALL_SLOTS.indexOf(start);
      const newEndIdx = ALL_SLOTS.indexOf(end);
      
      if (newStartIdx >= newEndIdx) return res.status(400).json({ error: 'Start time must be before end time' });

      const doc = await db.collection('weekly_timetable').findOne({ _id: 'default' });
      if (doc && doc[day]) {
        for (const block of doc[day]) {
          const exStartIdx = ALL_SLOTS.indexOf(block.start);
          const exEndIdx = ALL_SLOTS.indexOf(block.end);
          if (Math.max(newStartIdx, exStartIdx) < Math.min(newEndIdx, exEndIdx)) {
            return res.status(400).json({ error: 'Time block overlaps with an existing schedule for this day.' });
          }
        }
      }

      await db.collection('weekly_timetable').updateOne(
        { _id: 'default' },
        { $push: { [day]: { start, end, label } } },
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }

    if (action === 'update-weekly-block') {
      const { day, index, start, end, label } = req.body;
      const ALL_SLOTS = generateAllSlots();
      const newStartIdx = ALL_SLOTS.indexOf(start);
      const newEndIdx = ALL_SLOTS.indexOf(end);
      if (newStartIdx >= newEndIdx) return res.status(400).json({ error: 'Start time must be before end time' });
      
      const doc = await db.collection('weekly_timetable').findOne({ _id: 'default' });
      if (doc && doc[day]) {
        for (let i = 0; i < doc[day].length; i++) {
          if (i === index) continue;
          const block = doc[day][i];
          const exStartIdx = ALL_SLOTS.indexOf(block.start);
          const exEndIdx = ALL_SLOTS.indexOf(block.end);
          if (Math.max(newStartIdx, exStartIdx) < Math.min(newEndIdx, exEndIdx)) {
            return res.status(400).json({ error: 'Time block overlaps with an existing schedule for this day.' });
          }
        }
        
        const newArr = [...doc[day]];
        newArr[index] = { start, end, label };
        await db.collection('weekly_timetable').updateOne(
          { _id: 'default' },
          { $set: { [day]: newArr } }
        );
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: 'Block not found' });
    }

    if (action === 'delete-weekly-block') {
      const { day, index } = req.body;
      const doc = await db.collection('weekly_timetable').findOne({ _id: 'default' });
      if (doc && doc[day]) {
        const newArr = [...doc[day]];
        newArr.splice(index, 1);
        await db.collection('weekly_timetable').updateOne(
          { _id: 'default' },
          { $set: { [day]: newArr } }
        );
      }
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
