export async function ensureIndexes(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('blockedIps').createIndex({ ip: 1 }, { unique: true });
  await db.collection('logs').createIndex({ createdAt: -1 });
  await db.collection('logs').createIndex({ event: 1 });
  await db.collection('logs').createIndex({ userId: 1 });
}
