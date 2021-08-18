/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo florafauna scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://zfang:flora@florafauna.t5n7j.mongodb.net/myFirstDatabase init.mongo.js
 *   mongosh "mongodb+srv://florafauna.rlhox.mongodb.net/FloraFauna" --username arzqlin
 */

/* global db */
/* eslint no-restricted-globals: "off" */


db.posts.deleteMany({});
db.deleted_posts.deleteMany({});

const postsDB = [
  {
    title: 'A Turkey',
    authorId: '1',
    id: '6089e736-0364-4c44-8497-6d7bb0e72084',
    spottedUTC: '2017-05-15T09:10:23Z',
    createdUTC: '2017-08-15T09:10:23Z',
    timezone: 'UTC+9',
    location: {
      lat: 42.341146910114595,
      lng: -71.0917251720235,
    },
    sightingType: 'ANIMAL',
    description: 'I saw a turkey',
    confirmedCount: 0,
  },
  {
    title: 'A Poppy',
    id: '93b6ddf1-8fc9-4047-a913-d8341b83cd76',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.371375,
      lng: -71.143951,
    },
    sightingType: 'PLANT',
    description: 'I saw a poppy - Mount Auburn ',
    confirmedCount: 0,
  },
  {
    title: 'Frogs',
    id: '81a09ea1-9569-429e-8d46-f042f68fedf8',
    authorId: '3',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.388557,
      lng: -71.154385,
    },
    sightingType: 'ANIMAL',
    description: 'Frogs in Fresh Pond',
    confirmedCount: 0,
  },
  {
    title: 'Chicken of the Woods',
    id: 'b6240353-d87a-47b7-bf80-a751a0b18baf',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.296604,
      lng: -71.124354,
    },
    sightingType: 'PLANT',
    description: 'Chicken of the Woods in the Arboretum',
    confirmedCount: 0,
  },
  {
    title: 'Burdock Root',
    id: 'be939c27-c990-4db9-915d-821d73fed12f',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.326507,
      lng: -71.114461,
    },
    sightingType: 'PLANT',
    description: 'Burdock Root in Olmsted Park',
    confirmedCount: 0,
  },
  {
    title: 'Chanterelles',
    id: 'ba9a9eeb-e9c2-4aec-a348-432e178f90c5',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.439543,
      lng: -71.111679,
    },
    sightingType: 'PLANT',
    description: 'Chanterelles in the Fells',
    confirmedCount: 0,
  },
  {
    title: 'Pigeons',
    id: 'f381dd5e-b12d-489d-aaad-f0761609d7f4',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.355169,
      lng: -71.065041,
    },
    sightingType: 'ANIMAL',
    description: 'Pigeons in the Commons',
    confirmedCount: 0,
  },
  {
    title: 'Ducks',
    id: '3969f971-25fb-415e-a8c8-bd27691ff44b',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.354378,
      lng: -71.069590,
    },
    sightingType: 'ANIMAL',
    description: 'Ducks in the Boston Public Garden',
    confirmedCount: 0,
  },
  {
    title: 'Geese',
    id: '1df64080-ca68-4a3b-a299-f9115a7ade8c',
    authorId: '2',
    spottedUTC: '2018-01-15T09:10:23Z',
    createdUTC: '2019-08-15T09:10:23Z',
    timezone: 'UTC-8',
    location: {
      lat: 42.369292,
      lng: -71.070027,
    },
    sightingType: 'ANIMAL',
    description: 'Geese at the Museum of Science',
    confirmedCount: 0,
  },
];

db.posts.insertMany(postsDB);
const count = db.posts.count();

db.counters.deleteMany({ _id: 'posts' });
db.counters.insertOne({ _id: 'posts', current: count });

db.posts.createIndex({ id: 1 }, { unique: true });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ created: 1 });
db.posts.createIndex({ title: 'text', description: 'text' });
db.deleted_posts.createIndex({ id: 1 }, { unique: true });
