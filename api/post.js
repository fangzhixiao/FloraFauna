const uuid = require('uuid');
const s3 = require('@aws-sdk/client-s3');
const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db.js');
const { mustBeSignedIn } = require('./auth.js');

/**
 * These are functions related to post objects in the database.
 */

function validate(post) {
  const errors = [];
  if (post.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (post.sightingType !== 'PLANT' && post.sightingType !== 'ANIMAL') {
    errors.push('Field "sightingType" must be "PLANT" or "ANIMAL"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

class Controller {
  constructor(props) {
    this.db = props.db;
    this.s3Client = props.s3Client;
    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
  }

  async add(_, { post }) {
    validate(post);

    const keys = [];

    if (post.images) {
      await Promise.all(post
        .images
        .map(image => Buffer.from(image, 'base64'))
        .map(async (image) => {
          const key = uuid.v4();
          try {
            keys.push(key);
            await this.s3Client.send(new s3.PutObjectCommand({
              Bucket: 'florafauna-images',
              Key: key,
              Body: image,
            }));
          } catch (err) {
            throw new Error('image upload failed');
          }
        }));
    }

    const newPost = Object.assign({}, post);
    newPost.created = new Date();
    newPost.id = uuid.v4();
    newPost.imageKeys = keys;

    const result = await this.db.collection('posts').insertOne(newPost);
    const savedPost = await this.db.collection('posts').findOne({ _id: result.insertedId });

    return savedPost;
  }

  async get(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    return post;
  }

  // TODO: filtering based on spotted and minHour maxHour not implemented
  async list(_, {
    sightingType, search, authorId, spotted, minHour, maxHour,
  }) {
    const filter = {};
    if (sightingType) filter.sightingType = sightingType;
    if (search) filter.$text = { $search: search };
    if (authorId) filter.authorId = authorId;

    const posts = this.db.collection('posts').find(filter).toArray();
    if (spotted) {
      const filtered = posts.filter(post => post.spotted.getFullYear() === spotted.getFullYear()
        && post.spotted.getMonth() === spotted.getMonth()
        && post.spotted.getDate() === spotted.getDate());
      return filtered;
    }
    if (minHour && maxHour) {
      const filtered = posts.filter(post => post.spotted.getHours() > minHour.getHours()
          && post.spotted.getHours() < maxHour.getHours());
      return filtered;
    }
    return posts;
  }

  async update(_, { id, changes }) {
    const post = await this.db.collection('posts').findOne({ id });
    Object.assign(post, changes);
    if (changes.title || changes.sightingType) {
      validate(post);
    }
    await this.db.collection('posts').updateOne({ id }, { $set: changes });
    const savedPost = await this.db.collection('posts').findOne({ id });
    return savedPost;
  }
}

// async function add(_, { post }) {
//   const db = getDb();
//
//   const keys = [];
//   if (post.images) {
//     post
//       .images
//       .map(image => Buffer.from(image, 'base64'))
//       .map(async (image) => {
//         const key = uuid.v4();
//         try {
//           keys.push(key);
//           await this.s3Client.send(new s3.PutObjectCommand({
//             Bucket: 'florafauna-images',
//             Key: key,
//             Body: image,
//           }));
//         } catch (err) {
//           throw new Error('image upload failed');
//         }
//       });
//   }
//   validate(post);
//
//   const newPost = Object.assign({}, post);
//   newPost.created = new Date();
//   newPost.id = await getNextSequence('posts');
//   newPost.imageKeys = keys;
//
//   const result = await db.collection('posts').insertOne(newPost);
//   const savedPost = await db.collection('posts').findOne({ _id: result.insertedId });
//
//   return savedPost;
// }

// async function get(_, { id }) {
//   const db = getDb();
//   const post = await db.collection('posts').findOne({ id });
//   return post;
// }

// async function list(_, {
//   sightingType, search, authorId,
// }) {
//   const db = getDb();
//   const filter = {};
//   if (sightingType) filter.sightingType = sightingType;
//   if (search) filter.$text = { $search: search };
//   if (authorId) filter.authorId = authorId;
//
//   const posts = db.collection('posts').find(filter).toArray();
//   return posts;
// }


async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.sightingType) {
    const post = await db.collection('posts').findOne({ id });
    Object.assign(post, changes);
    validate(post);
  }
  await db.collection('posts').updateOne({ id }, { $set: changes });
  const savedPost = await db.collection('posts').findOne({ id });
  return savedPost;
}

async function remove(_, { id }) {
  const db = getDb();
  const post = await db.collection('posts').findOne({ id });
  if (!post) return false;
  post.deleted = new Date();
  let result = await db.collection('deleted_posts').insertOne(post);
  if (result.insertedId) {
    result = await db.collection('posts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function restore(_, { id }) {
  const db = getDb();
  const post = await db.collection('deleted_posts').findOne({ id });
  if (!post) return false;
  post.deleted = new Date();
  let result = await db.collection('posts').insertOne(post);
  if (result.insertedId) {
    result = await db.collection('deleted_posts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

// mustbeSignedIn to make sure that if not signed in, user can only see posts, no mutations.
module.exports = {
  Controller,
  // list,
  // add: mustBeSignedIn(add),
  // get,
  // update: mustBeSignedIn(update),
  // delete: mustBeSignedIn(remove),
  // restore: mustBeSignedIn(restore),
};
