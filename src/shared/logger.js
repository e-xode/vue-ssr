export function logEvent(db, { event, userId = null, ip = null, meta = {} }) {
  db.collection('logs').insertOne({ event, userId, ip, meta, createdAt: new Date() }).catch(err => console.error('logEvent error:', err))
}
