import { mongoConnect, mongoClose } from '../src/shared/mongo.js';
import { USER_TYPES } from '../src/shared/const.js';

const QA_EMAIL = 'qa@e-xode.net';

const { db, error } = await mongoConnect();
if (error || !db) {
  console.error('Seed failed: could not connect to MongoDB:', error);
  process.exit(1);
}

try {
  const existing = await db.collection('users').findOne({ email: QA_EMAIL });
  if (existing) {
    console.log(`Dev QA user already exists: ${QA_EMAIL} (id: ${existing._id})`);
  } else {
    const result = await db.collection('users').insertOne({
      email: QA_EMAIL,
      password: '',
      name: 'QA Visual',
      type: USER_TYPES.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Dev QA user created: ${QA_EMAIL} (id: ${result.insertedId})`);
  }
} catch (err) {
  console.error('Seed dev user error:', err);
  await mongoClose();
  process.exit(1);
}

await mongoClose();
