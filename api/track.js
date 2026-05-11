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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Tracking ID is required' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('trackingDB');
    
    // Find the submission by trackingId
    const submission = await db.collection('submissions').findOne(
      { trackingId: id },
      { projection: { _id: 0, trackingId: 1, source: 1, type: 1, status: 1, adminNote: 1, timeline: 1, duration: 1, createdAt: 1, updatedAt: 1 } }
    );

    if (!submission) {
      return res.status(404).json({ error: 'Invalid Tracking ID or not found.' });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error('Tracking lookup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
