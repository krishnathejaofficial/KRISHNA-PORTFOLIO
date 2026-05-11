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

// Generate all slots from 8:00 AM to 12:00 AM (midnight) in 30-min intervals
function generateAllSlots() {
  const slots = [];
  for (let h = 8; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const minStr = m === 0 ? '00' : '30';
      slots.push(`${String(hour12).padStart(2,'0')}:${minStr} ${ampm}`);
    }
  }
  return slots; // 32 slots: 8:00 AM → 11:30 PM
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
      const client = await connectToDatabase();
      const db = client.db('trackingDB');

      const ALL_SLOTS = generateAllSlots();

      // 1. Admin blocked slots with notes
      const blockedDoc = await db.collection('blocked_slots').findOne({ date });
      const adminBlockedMap = blockedDoc ? blockedDoc.slotData || {} : {};
      // Legacy support for old 'times' array format
      if (blockedDoc?.times) {
        blockedDoc.times.forEach(t => { if (!adminBlockedMap[t]) adminBlockedMap[t] = { blocked: true, note: '' }; });
      }
      const dayFullyBlocked = blockedDoc?.dayLocked || false;

      // 2. Booked meetings (accepted or pending, not rejected)
      const bookings = await db.collection('submissions').find({
        source: 'meeting',
        timeline: { $regex: `^${date}` },
        status: { $nin: ['Rejected'] }
      }).toArray();

      // Build booked time range set
      const bookedSlotSet = new Set();
      bookings.forEach(b => {
        const timePart = b.timeline.replace(`${date} at `, '').replace(' IST', '').trim();
        const dur = parseInt(b.duration) || 30;
        const slotsNeeded = Math.ceil(dur / 30);
        const startIdx = ALL_SLOTS.indexOf(timePart);
        for (let i = 0; i < slotsNeeded; i++) {
          if (startIdx + i < ALL_SLOTS.length) bookedSlotSet.add(ALL_SLOTS[startIdx + i]);
        }
      });

      // 3. Past time filtering for today (IST)
      const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const todayIST = nowIST.toISOString().split('T')[0]; // YYYY-MM-DD in IST
      const isToday = date === todayIST;
      const nowHour = nowIST.getHours();
      const nowMin = nowIST.getMinutes();

      // 4. Build result
      const slotDetails = ALL_SLOTS.map(slot => {
        const adminData = adminBlockedMap[slot] || {};
        const isAdminBlocked = dayFullyBlocked || adminData.blocked || false;
        const isBooked = bookedSlotSet.has(slot);

        // Check if past
        let isPast = false;
        if (isToday) {
          const [time, ap] = slot.split(' ');
          let [sh, sm] = time.split(':').map(Number);
          if (ap === 'PM' && sh !== 12) sh += 12;
          if (ap === 'AM' && sh === 12) sh = 0;
          isPast = sh < nowHour || (sh === nowHour && sm <= nowMin);
        }

        return {
          time: slot,
          available: !isAdminBlocked && !isBooked && !isPast,
          isBooked,
          isAdminBlocked,
          isPast,
          note: adminData.note || ''
        };
      });

      return res.status(200).json({ success: true, slots: slotDetails, dayLocked: dayFullyBlocked });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
