import { mongoConnect, mongoClose } from '../src/shared/mongo.js';
import { ADMIN_PROMOTION, promoteToAdmin } from '../src/shared/dbHelpers.js';

const USAGE = 'Usage: npm run seed:admin -- <email>';

const MESSAGES = {
  [ADMIN_PROMOTION.INVALID_EMAIL]: USAGE,
  [ADMIN_PROMOTION.NOT_FOUND]: 'No account with this email. Sign up first, then run this again.',
  [ADMIN_PROMOTION.ALREADY_ADMIN]: 'This account is already an admin.',
  [ADMIN_PROMOTION.PROMOTED]: 'Account promoted to admin. Sign in again to see the admin pages.',
};

const SUCCESSFUL_OUTCOMES = [ADMIN_PROMOTION.ALREADY_ADMIN, ADMIN_PROMOTION.PROMOTED];

const email = process.argv[2];
if (!email) {
  console.error(USAGE);
  process.exit(64);
}

const { db, error } = await mongoConnect();
if (error || !db) {
  console.error('Could not connect to MongoDB:', error);
  process.exit(1);
}

let exitCode = 1;
try {
  const outcome = await promoteToAdmin(db, email);
  const succeeded = SUCCESSFUL_OUTCOMES.includes(outcome);
  console[succeeded ? 'log' : 'error'](MESSAGES[outcome]);
  exitCode = succeeded ? 0 : 1;
} catch (err) {
  console.error('Admin promotion failed:', err);
}

await mongoClose();
process.exit(exitCode);
