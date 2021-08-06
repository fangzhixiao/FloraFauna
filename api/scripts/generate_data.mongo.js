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

const uuid = require('uuid');

const sightingTypes = ['ANIMAL', 'PLANT'];

for (let i = 0; i < 100; i += 1) {
  const randomCreatedDate = (new Date()) - Math.floor(Math.random() * 60) * 1000 * 60 * 60 * 24;
  const created = new Date(randomCreatedDate);
  const spotted = new Date(randomCreatedDate);
  const randomLat = Math.random() * 360 - 180;
  const randomLon = Math.random() * 360 - 180;
  const location = { lat: randomLat, lng: randomLon };

  const id = uuid.v4();
  const authorId = Math.floor(Math.random() * 50);
  const sightingType = sightingTypes[Math.floor(Math.random() * 2)];
  const title = `Lorem ipsum dolor sit amet, ${i}`;
  const description = 'Lorem ipsun dolor sit amet';

  const post = {
    id, authorId, title, created, sightingType, location, spotted, description,
  };

  db.posts.insertOne(post);
}

const count = db.posts.count();
db.counters.updateOne({ _id: 'posts' }, { $set: { current: count } });

print('New post count:', count);
