import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Default availability status
const DEFAULT_STATUS = {
  status: 'available', // 'available' | 'busy' | 'away' | 'dnd'
  message: 'Open to opportunities! Feel free to reach out.',
  updatedAt: new Date().toISOString()
};

const STATUS_META = {
  available: { label: 'Available', color: '#10b981', icon: 'fa-circle-check' },
  busy: { label: 'Busy', color: '#f59e0b', icon: 'fa-clock' },
  away: { label: 'Away', color: '#6366f1', icon: 'fa-moon' },
  dnd: { label: 'Do Not Disturb', color: '#ef4444', icon: 'fa-ban' }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');

    if (req.method === 'GET') {
      const doc = await db.collection('settings').findOne({ _id: 'availability' });
      const data = doc || DEFAULT_STATUS;
      return res.status(200).json({
        success: true,
        status: data.status || 'available',
        message: data.message || DEFAULT_STATUS.message,
        updatedAt: data.updatedAt,
        meta: STATUS_META[data.status || 'available']
      });
    }

    if (req.method === 'POST') {
      const { status, message, token } = req.body;
      // Verify admin token
      const adminDoc = await db.collection('auth').findOne({ role: 'admin', sessionToken: token });
      if (!adminDoc || Date.now() > adminDoc.sessionExpiry) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!STATUS_META[status]) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      await db.collection('settings').updateOne(
        { _id: 'availability' },
        { $set: { status, message: message || DEFAULT_STATUS.message, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Availability error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
