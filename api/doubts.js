import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
const ADMIN_EMAIL = 'krishnatejareddy2003@gmail.com';
const GMAIL_APP_PASSWORD = 'kqdvnpdqtneakjjr';

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
  auth: { user: ADMIN_EMAIL, pass: GMAIL_APP_PASSWORD }
});

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"G. Krishna Teja" <${ADMIN_EMAIL}>`,
    to,
    subject,
    html
  });
}

/* ── Email to Admin when a new doubt arrives ── */
function buildAdminNotification(doubt) {
  const categoryIcons = {
    'Biotechnology & Research': '🔬',
    'Programming & Tech': '💻',
    'Business & Career': '💼',
    'Academic Advice': '🎓',
    'Life Sciences & Pharma': '🧬',
    'Projects & Collaboration': '🚀',
  };
  const emoji = categoryIcons[doubt.category] || '❓';
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:linear-gradient(135deg,#1a0a2e 0%,#1f1550 50%,#0d1117 100%);padding:36px 32px;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(139,92,246,0.2);border:2px solid #8b5cf6;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px;">
          ${emoji}
        </div>
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">New Question Received!</h1>
        <p style="color:#9ca3af;font-size:14px;margin:8px 0 0 0;">Someone needs your expertise, Krishna</p>
      </div>
      <div style="padding:32px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#6b7280;width:140px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">ID</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;color:#8b5cf6;font-weight:800;letter-spacing:2px;font-family:monospace;">${doubt.doubtId}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">From</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">${doubt.name} &lt;<a href="mailto:${doubt.email}" style="color:#2563eb;">${doubt.email}</a>&gt;</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Category</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;"><span style="background:#f3e8ff;color:#7c3aed;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">${emoji} ${doubt.category}</span></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Visibility</td>
              <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;">${doubt.isPublic ? '🌍 Public Q&A' : '🔒 Private'}</td></tr>
        </table>
        <div style="background:#faf5ff;border-radius:12px;padding:20px;border-left:4px solid #8b5cf6;margin-bottom:20px;">
          <p style="margin:0 0 8px 0;font-size:13px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Subject</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#1f2937;">${doubt.subject}</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #eee;">
          <p style="margin:0 0 10px 0;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detailed Question</p>
          <p style="margin:0;color:#374151;line-height:1.8;white-space:pre-wrap;font-size:14px;">${doubt.question}</p>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="https://krishnateja.vercel.app/admin" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(139,92,246,0.4);">
            Open Admin Dashboard →
          </a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">G. Krishna Teja · Portfolio Doubt Clarification System</p>
      </div>
    </div>
  `;
}

/* ── Auto-reply to the questioner ── */
function buildSubmitterAutoReply(doubt) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:linear-gradient(135deg,#1a0a2e 0%,#2d1b69 50%,#0d1117 100%);padding:36px 32px;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(139,92,246,0.25);border:2px solid #8b5cf6;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px;">✅</div>
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Question Received!</h1>
        <p style="color:#9ca3af;font-size:14px;margin:8px 0 0 0;">Krishna will personally answer your question</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px 0;">Hi <strong>${doubt.name}</strong>,</p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
          Thank you for reaching out! I've received your question about <strong>"${doubt.subject}"</strong> and will personally review and answer it within <strong>24–48 hours</strong>.
        </p>
        <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(212,175,55,0.05));border-radius:14px;padding:22px;border:1px dashed rgba(139,92,246,0.4);text-align:center;margin:24px 0;">
          <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Question ID</p>
          <p style="margin:0;font-size:28px;font-weight:800;color:#8b5cf6;letter-spacing:4px;font-family:monospace;">${doubt.doubtId}</p>
          <p style="margin:10px 0 0 0;font-size:12px;color:#9ca3af;">You'll receive an email notification when Krishna answers</p>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:18px;border-left:4px solid #8b5cf6;">
          <p style="margin:0 0 6px 0;font-size:12px;color:#7c3aed;font-weight:600;text-transform:uppercase;">Your Question</p>
          <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${doubt.subject}</p>
          <p style="margin:8px 0 0 0;color:#6b7280;font-size:13px;line-height:1.6;">${doubt.question.slice(0, 200)}${doubt.question.length > 200 ? '...' : ''}</p>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:20px 0 0 0;">
          ${doubt.isPublic ? '🌍 Your Q&A may be featured on the portfolio (anonymously) to help others with similar questions.' : '🔒 Your question is private — only you and Krishna will see it.'}
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">G. Krishna Teja · VIT University · Biotechnology & Business Professional<br/>
        <a href="https://krishnateja.vercel.app" style="color:#8b5cf6;text-decoration:none;">krishnateja.vercel.app</a></p>
      </div>
    </div>
  `;
}

/* ── Answer notification to the questioner ── */
function buildAnswerNotification(doubt, answer) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:linear-gradient(135deg,#064e3b 0%,#1a0a2e 50%,#0d1117 100%);padding:36px 32px;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,0.2);border:2px solid #10b981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px;">🎯</div>
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Krishna Answered Your Question!</h1>
        <p style="color:#9ca3af;font-size:14px;margin:8px 0 0 0;">Your doubt has been clarified</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 20px 0;">Hi <strong>${doubt.name}</strong>,</p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
          Great news! Krishna has personally answered your question. Here's the response:
        </p>

        <!-- Original Question -->
        <div style="background:#f9fafb;border-radius:12px;padding:18px;border-left:4px solid #8b5cf6;margin-bottom:16px;">
          <p style="margin:0 0 8px 0;font-size:12px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px;">❓ Your Question</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#1f2937;">${doubt.subject}</p>
          <p style="margin:8px 0 0 0;color:#6b7280;font-size:13px;line-height:1.6;">${doubt.question}</p>
        </div>

        <!-- Krishna's Answer -->
        <div style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(212,175,55,0.05));border-radius:14px;padding:24px;border:1px solid rgba(16,185,129,0.3);margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#f0c14b);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🧬</div>
            <div>
              <p style="margin:0;font-size:15px;font-weight:700;color:#065f46;">Krishna's Answer</p>
              <p style="margin:2px 0 0 0;font-size:12px;color:#6b7280;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.8;white-space:pre-wrap;">${answer}</p>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="https://krishnateja.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#f0c14b);color:#111;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(212,175,55,0.3);">
            Visit Portfolio →
          </a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">G. Krishna Teja · VIT University<br/>
        <a href="https://krishnateja.vercel.app" style="color:#D4AF37;text-decoration:none;">krishnateja.vercel.app</a></p>
      </div>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, token } = req.body;

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');

    /* ── PUBLIC: Submit a new doubt ── */
    if (action === 'submit') {
      const { category, name, email, subject, question, isPublic } = req.body;
      if (!name || !email || !subject || !question || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doubtId = `DQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const doubt = {
        doubtId,
        category,
        name,
        email,
        subject,
        question,
        isPublic: !!isPublic,
        status: 'Pending',
        answer: '',
        answeredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('doubts').insertOne(doubt);

      // Log activity
      await db.collection('activity_log').insertOne({
        action: 'new_doubt',
        doubtId,
        name,
        email,
        category,
        source: 'doubt',
        timestamp: new Date(),
      });

      // Notify admin
      try {
        await sendEmail(
          ADMIN_EMAIL,
          `❓ New Question [${doubtId}]: ${subject} — ${name}`,
          buildAdminNotification(doubt)
        );
      } catch (e) { console.error('Admin notify error:', e); }

      // Auto-reply to submitter
      try {
        await sendEmail(
          email,
          `✅ Your Question Received! [${doubtId}] — G. Krishna Teja`,
          buildSubmitterAutoReply(doubt)
        );
      } catch (e) { console.error('Auto-reply error:', e); }

      return res.status(200).json({ success: true, doubtId });
    }

    /* ── ADMIN: Get all doubts ── */
    if (action === 'get-doubts') {
      // Verify admin token
      const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
      if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const doubts = await db.collection('doubts').find().sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, doubts });
    }

    /* ── ADMIN: Answer a doubt ── */
    if (action === 'answer-doubt') {
      // Verify admin token
      const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
      if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { doubtId, answer } = req.body;
      if (!doubtId || !answer?.trim()) {
        return res.status(400).json({ error: 'Missing doubtId or answer' });
      }

      const doubt = await db.collection('doubts').findOne({ doubtId });
      if (!doubt) return res.status(404).json({ error: 'Question not found' });

      await db.collection('doubts').updateOne(
        { doubtId },
        {
          $set: {
            answer: answer.trim(),
            status: 'Answered',
            answeredAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );

      // Log activity
      await db.collection('activity_log').insertOne({
        action: 'doubt_answered',
        doubtId,
        name: doubt.name,
        source: 'admin',
        timestamp: new Date(),
      });

      // Notify the questioner via email
      try {
        await sendEmail(
          doubt.email,
          `🎯 Your Question Answered! [${doubtId}] — G. Krishna Teja`,
          buildAnswerNotification(doubt, answer.trim())
        );
      } catch (e) { console.error('Answer notify error:', e); }

      return res.status(200).json({ success: true });
    }

    /* ── ADMIN: Update doubt status ── */
    if (action === 'update-doubt-status') {
      const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
      if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { doubtId, status: newStatus } = req.body;
      await db.collection('doubts').updateOne(
        { doubtId },
        { $set: { status: newStatus, updatedAt: new Date() } }
      );
      return res.status(200).json({ success: true });
    }

    /* ── ADMIN: Delete a doubt ── */
    if (action === 'delete-doubt') {
      const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
      if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { doubtId } = req.body;
      await db.collection('doubts').deleteOne({ doubtId });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Doubts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
