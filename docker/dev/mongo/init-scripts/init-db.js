const { MONGO_USER, MONGO_PWD, MONGO_DB } = process.env;

db.getSiblingDB(MONGO_DB).createUser({
  user: MONGO_USER,
  pwd: MONGO_PWD,
  roles: [{ db: MONGO_DB, role: 'readWrite' }],
});
