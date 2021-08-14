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
const { DateTime } = require('luxon');
const uuid = require('uuid');

// Settings.defaultZone = 'utc';
const sightingTypes = ['ANIMAL', 'PLANT'];
const timezones = ['+', '-'];
const userIds = [];
for (let i = 0; i < 5; i+= 1) {
  userIds.push(uuid.v4());
}

for (let i = 0; i < 40; i += 1) {
  const randomCreatedDate = (new Date()) - Math.floor(Math.random() * 60 * 1000 * 60 * 60 * 24);
  const spottedUTC = DateTime.fromJSDate(new Date(randomCreatedDate)).setZone("UTC").toISO();

  const randomLat = Math.random() * 140 - 70;
  const randomLon = Math.random() * 360 - 180;
  const location = { lat: randomLat, lng: randomLon };

  const id = uuid.v4();
  const authorId = userIds[Math.floor(Math.random() * 5)];
  const sightingType = sightingTypes[Math.floor(Math.random() * 2)];
  const title = `Lorem ipsum dolor sit amet, ${i}`;
  const description = 'Lorem ipsun dolor sit amet';
  const timezone = 'UTC' + timezones[Math.floor(Math.random() * 2)] + Math.floor(Math.random() * 12);
  const createdUTC = '2021-08-11T03:03:07.546Z';
  const post = {
    id, title, sightingType, authorId, spottedUTC, timezone, location, createdUTC, description,
  };

  db.posts.insertOne(post);
}

const count = db.posts.count();
db.counters.updateOne({ _id: 'posts' }, { $set: { current: count } });

print('New post count:', count);
