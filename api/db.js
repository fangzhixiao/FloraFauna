require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;

async function connectToDb() {
  const url = process.env.DB_URL || 'mongodb://localhost/FloraFauna';
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getDb() {
  if (db === undefined || db === null) {
    const url = process.env.DB_URL || 'mongodb://localhost/FloraFauna';
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
  }

  return db;
}

async function connect() {
  const url = process.env.DB_URL || 'mongodb://localhost/FloraFauna';
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  console.log('Connected to MongoDB at', url);

  return client.db();
}

module.exports = {
  connectToDb, getNextSequence, getDb, connect,
};
