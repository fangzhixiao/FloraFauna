const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db.js');
const { mustBeSignedIn } = require('./auth.js');

/**
 * These are functions related to post objects in the database.
 *
 */

async function get(_, { id }) {
  const db = getDb();
  const post = await db.collection('posts').findOne({ id });
  return post;
}

async function list(_, {
  sightingType, search,
}) {
  const db = getDb();
  const filter = {};
  if (sightingType) filter.sightingType = sightingType;
  if (search) filter.$text = { $search: search };

  const posts = db.collection('posts').find(filter).toArray();
  return posts;
}

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

async function add(_, { post }) {
  const db = getDb();
  validate(post);

  const newPost = Object.assign({}, post);
  newPost.created = new Date();
  newPost.id = await getNextSequence('posts');

  const result = await db.collection('posts').insertOne(newPost);
  const savedPost = await db.collection('posts')
    .findOne({ _id: result.insertedId });
  return savedPost;
}

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
  list,
  add: mustBeSignedIn(add),
  get,
  update: mustBeSignedIn(update),
  delete: mustBeSignedIn(remove),
  restore: mustBeSignedIn(restore),
};
