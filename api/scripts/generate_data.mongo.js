/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/generate_data.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/generate_data.mongo.js
 */

/* global db print */
/* eslint no-restricted-globals: "off" */

const authors = ['Ravan', 'Eddie', 'Pieta', 'Parvati', 'Victor'];
const sightingTypes = ['ANIMAL', 'PLANT'];
const initialCount = db.posts.count();

for (let i = 0; i < 100; i += 1) {
  const randomCreatedDate = (new Date()) - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
  const created = new Date(randomCreatedDate);
  const spotted = new Date(randomCreatedDate);
  const randomLat = Math.random() * 360 - 180;
  const randomLon = Math.random() * 360 - 180;
  const location = { lat: randomLat, lon: randomLon };

  const author = authors[Math.floor(Math.random() * 5)];
  const sightingType = sightingTypes[Math.floor(Math.random() * 2)];
  const title = `Lorem ipsum dolor sit amet, ${i}`;
  const id = initialCount + i + 1;

  const post = {
    id, author, title, created, sightingType, location, spotted,
  };

  db.posts.insertOne(post);
}

const count = db.posts.count();
db.counters.updateOne({ _id: 'posts' }, { $set: { current: count } });

print('New post count:', count);
