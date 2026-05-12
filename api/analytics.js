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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');

    if (req.method === 'POST') {
      // Track a page visit
      const { page, referrer, userAgent, country } = req.body;
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
      
      await db.collection('analytics').insertOne({
        page: page || '/',
        referrer: referrer || '',
        userAgent: userAgent || '',
        ip,
        country: country || 'unknown',
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0]
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const { type } = req.query;

      if (type === 'summary') {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [totalVisits, todayVisits, weekVisits, monthVisits, topPages, dailyChart] = await Promise.all([
          db.collection('analytics').countDocuments(),
          db.collection('analytics').countDocuments({ date: today }),
          db.collection('analytics').countDocuments({ date: { $gte: weekAgo } }),
          db.collection('analytics').countDocuments({ date: { $gte: monthAgo } }),
          db.collection('analytics').aggregate([
            { $group: { _id: '$page', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]).toArray(),
          // Last 7 days daily counts
          db.collection('analytics').aggregate([
            { $match: { date: { $gte: weekAgo } } },
            { $group: { _id: '$date', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ]).toArray()
        ]);

        // Unique visitors (by IP, last 30 days)
        const uniqueIPs = await db.collection('analytics').distinct('ip', { date: { $gte: monthAgo } });

        return res.status(200).json({
          success: true,
          data: {
            totalVisits,
            todayVisits,
            weekVisits,
            monthVisits,
            uniqueVisitors: uniqueIPs.length,
            topPages: topPages.map(p => ({ page: p._id, count: p.count })),
            dailyChart: dailyChart.map(d => ({ date: d._id, count: d.count }))
          }
        });
      }

      return res.status(400).json({ error: 'Invalid type' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
