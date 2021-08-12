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


db.posts.deleteMany({});
db.deleted_posts.deleteMany({});

const postsDB = [
<<<<<<< HEAD
  {
    title: 'A Turkey',
    authorId: 1,
    created: new Date('2019-01-15'),
    spotted: new Date('2019-01-14'),
    spottedUTC: "2017-05-15T09:10:23Z",
    createdUTC: "2017-08-15T09:10:23Z",
    timezone: "UTC+9",
    location: {
      lat: 42.341146910114595,
      lng: -71.0917251720235,
=======
    {
        title: 'A Turkey',
        authorId: 1,
        id: 123,
        spottedUTC: "2017-05-15T09:10:23Z",
        createdUTC: "2017-08-15T09:10:23Z",
        timezone: "UTC+9",
        location: {
            lat: 42.341146910114595,
            lng: -71.0917251720235,
        },
        sightingType: 'ANIMAL',
        description: 'I saw a turkey',
>>>>>>> 6f6d299a189376a0d02e438fcbe88ff9882bc216
    },
    {
        title: 'A Poppy',
        id: 345,
        authorId: 2,
        spottedUTC: "2018-01-15T09:10:23Z",
        createdUTC: "2019-08-15T09:10:23Z",
        timezone: "UTC-8",
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
