const uuid = require('uuid');
const s3 = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { UserInputError } = require('apollo-server-express');

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
    this.remove = this.remove.bind(this);
    this.restore = this.restore.bind(this);
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

    delete post.images;
    const newPost = Object.assign({}, post);
    newPost.created = new Date();
    newPost.id = uuid.v4();
    newPost.imageKeys = keys;

    const result = await this.db.collection('posts').insertOne(newPost);
    const savedPost = await this.get(this, { id: result.ops[0].id });
    return savedPost;
  }

  async get(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    const imageUrls = [];

    if (post.imageKeys == null) {
      return post;
    }

    for (const imageKey of post.imageKeys) {
      const url = await getSignedUrl(this.s3Client, new s3.GetObjectCommand({
        Bucket: 'florafauna-images',
        Key: imageKey,
      }), { expiresIn: 3600 });
      imageUrls.push(url);
    }
    console.log(imageUrls);
    post.imageUrls = imageUrls;
    delete post.imageKeys;
    return post;
  }

  // TODO: filtering based on spotted and minHour maxHour not implemented
  async list(_, {
    sightingType, search, authorId, spotted, minHour, maxHour,
  }) {
    console.log('new query');
    const filter = {};
    if (sightingType) filter.sightingType = sightingType;
    if (search) filter.$text = { $search: search };
    if (authorId) filter.authorId = authorId;

    const posts = await this.db.collection('posts').find(filter).toArray();
    if (spotted) {
      const filtered = posts.filter(post => post.spotted.getFullYear() === spotted.getFullYear()
        && post.spotted.getMonth() === spotted.getMonth()
        && post.spotted.getDate() === spotted.getDate());
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

  async remove(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    if (!post) return false;
    post.deleted = new Date();
    let result = await this.db.collection('deleted_posts').insertOne(post);
    if (result.insertedId) {
      result = await this.db.collection('posts').removeOne({ id });
      return result.deletedCount === 1;
    }
    return false;
  }

  async restore(_, { id }) {
    const post = await this.db.collection('deleted_posts').findOne({ id });
    if (!post) return false;
    post.deleted = new Date();
    let result = await this.db.collection('posts').insertOne(post);
    if (result.insertedId) {
      result = await this.db.collection('deleted_posts').removeOne({ id });
      return result.deletedCount === 1;
    }
    return false;
  }
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
