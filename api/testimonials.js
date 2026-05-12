import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://krishnateja:Gteja1234@cluster0.3veyidf.mongodb.net/trackingDB?retryWrites=true&w=majority';
let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db('trackingDB');
}

function verifyToken(token) {
  // Same simple check used in admin.js
  return token && token.length > 10;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await getDb();
    const col = db.collection('testimonials');

    // ── PUBLIC: GET all testimonials ──────────────────────────────────────
    if (req.method === 'GET') {
      const docs = await col.find({}).sort({ order: 1, createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, testimonials: docs });
    }

    // ── ADMIN: POST actions ───────────────────────────────────────────────
    if (req.method === 'POST') {
      const { action, token, ...body } = req.body;

      if (!verifyToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // ADD
      if (action === 'add') {
        const { name, role, org, avatar, avatarColor, rating, text, relation, date } = body;
        if (!name || !text) return res.status(400).json({ error: 'Name and testimonial text are required.' });

        const count = await col.countDocuments();
        const doc = {
          name: name.trim(),
          role: (role || '').trim(),
          org: (org || '').trim(),
          avatar: (avatar || name.slice(0, 2).toUpperCase()).trim(),
          avatarColor: avatarColor || '#D4AF37',
          rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
          text: text.trim(),
          relation: (relation || '').trim(),
          date: (date || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })).trim(),
          order: count,
          createdAt: new Date()
        };
        const result = await col.insertOne(doc);
        return res.status(200).json({ success: true, id: result.insertedId });
      }

      // UPDATE
      if (action === 'update') {
        const { id, name, role, org, avatar, avatarColor, rating, text, relation, date, order } = body;
        if (!id) return res.status(400).json({ error: 'ID is required.' });

        const update = {};
        if (name !== undefined)        update.name        = name.trim();
        if (role !== undefined)        update.role        = role.trim();
        if (org !== undefined)         update.org         = org.trim();
        if (avatar !== undefined)      update.avatar      = avatar.trim();
        if (avatarColor !== undefined) update.avatarColor = avatarColor;
        if (rating !== undefined)      update.rating      = Math.min(5, Math.max(1, parseInt(rating)));
        if (text !== undefined)        update.text        = text.trim();
        if (relation !== undefined)    update.relation    = relation.trim();
        if (date !== undefined)        update.date        = date.trim();
        if (order !== undefined)       update.order       = parseInt(order);
        update.updatedAt = new Date();

        await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
        return res.status(200).json({ success: true });
      }

      // DELETE
      if (action === 'delete') {
        const { id } = body;
        if (!id) return res.status(400).json({ error: 'ID is required.' });
        await col.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ success: true });
      }

      // REORDER (drag-and-drop order save)
      if (action === 'reorder') {
        const { ids } = body; // array of id strings in new order
        if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array.' });
        await Promise.all(ids.map((id, idx) =>
          col.updateOne({ _id: new ObjectId(id) }, { $set: { order: idx } })
        ));
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Testimonials API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
