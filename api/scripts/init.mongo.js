/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo florafauna scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 *   mongosh "mongodb+srv://florafauna.rlhox.mongodb.net/FloraFauna" --username arzqlin
 */

/* global db print */
/* eslint no-restricted-globals: "off" */

const uuid = require('uuid');

db.posts.deleteMany({});
db.deleted_posts.deleteMany({});

const postsDB = [
  {
    title: 'A Turkey',
    authorId: 1,
    id: uuid.v4(),
    created: new Date('2019-01-15'),
    spotted: new Date('2019-01-14'),
    location: {
      lat: 42.341146910114595,
      lng: -71.0917251720235,
    },
    sightingType: 'ANIMAL',
    description: 'I saw a turkey',
  },
  {
    title: 'A Poppy',
    id: uuid.v4(),
    authorId: 2,
    created: new Date('2019-05-20'),
    spotted: new Date('2019-05-14'),
    location: {
      lat: 49.341146910114595,
      lng: -79.0917251720235,
    },
    sightingType: 'PLANT',
    description: 'I saw a poppy',
  },
];

db.posts.insertMany(postsDB);
const count = db.posts.count();
print('Inserted', count, 'posts');

db.counters.deleteMany({ _id: 'posts' });
db.counters.insertOne({ _id: 'posts', current: count });

db.posts.createIndex({ id: 1 }, { unique: true });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ created: 1 });
db.posts.createIndex({ title: 'text', description: 'text' });
db.deleted_posts.createIndex({ id: 1 }, { unique: true });
