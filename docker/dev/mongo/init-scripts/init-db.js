const jsonUsers = require('/json/users.json');
const initData = async() => {
  const db = new Mongo().getDB(process.env.MONGO_INITDB_DATABASE);
  const { MONGO_USER, MONGO_PWD, MONGO_DB } = process.env;
  db.createUser({ user: MONGO_USER, pwd: MONGO_PWD, roles: [{ db: MONGO_DB, role: 'readWrite' }] });
}
initData();