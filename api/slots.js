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

const DEFAULT_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
      const client = await connectToDatabase();
      const db = client.db('trackingDB');

      // 1. Fetch blocked slots for this date by admin
      const blockedDoc = await db.collection('blocked_slots').findOne({ date });
      const adminBlocked = blockedDoc ? blockedDoc.times : [];

      // 2. Fetch already booked meetings for this date
      // We look in 'submissions' where source='meeting' and timeline starts with the date
      // Assuming timeline format: "YYYY-MM-DD at HH:MM AM/PM IST"
      const bookings = await db.collection('submissions').find({ 
        source: 'meeting',
        timeline: { $regex: `^${date}` },
        status: { $ne: 'Rejected' } // Don't count rejected meetings
      }).toArray();

      const bookedTimes = bookings.map(b => b.timeline.split(' at ')[1].replace(' IST', ''));

      // 3. Calculate available slots
      const availableSlots = DEFAULT_SLOTS.filter(slot => !adminBlocked.includes(slot) && !bookedTimes.includes(slot));

      return res.status(200).json({ success: true, availableSlots, adminBlocked });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
