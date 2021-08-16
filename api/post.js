const uuid = require('uuid');
const s3 = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { UserInputError } = require('apollo-server-express');
const { DateTime, Settings } = require('luxon');
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
  if (!DateTime.local().setZone(post.timezone).isValid) {
    errors.push(DateTime.local().setZone(post.timezone).invalidReason);
  }
  if (!DateTime.fromISO(post.spottedUTC).isValid) {
    errors.push(DateTime.fromISO(post.spottedUTC).invalidReason);
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
    this.incrementConfirmed = this.incrementConfirmed.bind(this);
    this.decrementConfirmed = this.decrementConfirmed.bind(this);
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
    newPost.createdUTC = DateTime.utc().toString();
    newPost.spottedUTC = DateTime.fromISO(post.spottedUTC, { zone: 'utc' }).toString();
    newPost.id = uuid.v4();
    newPost.imageKeys = keys;
    newPost.confirmedCount = 0;

    const result = await this.db.collection('posts').insertOne(newPost);
    const savedPost = await this.get(this, { id: result.ops[0].id });
    return savedPost;
  }

  async get(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    const imageUrls = [];

    if (post.imageKeys != null) {
      for (const imageKey of post.imageKeys) {
        const url = await getSignedUrl(this.s3Client, new s3.GetObjectCommand({
          Bucket: 'florafauna-images',
          Key: imageKey,
        }), { expiresIn: 3600 });
        imageUrls.push(url);
      }
    }

    post.imageUrls = imageUrls;
    delete post.imageKeys;
    return post;
  }

  async list(_, {
    sightingType, search, authorId, dateUTC, minTimeUTC, maxTimeUTC, hasImage
  }) {
    console.log('new query');
    const filter = {};
    if (sightingType) filter.sightingType = sightingType;
    if (search) filter.$text = { $search: search };
    if (authorId) filter.authorId = authorId;

    let posts = await this.db.collection('posts').find(filter).toArray();
    if (dateUTC || minTimeUTC || hasImage != null ) {
      const filteredPosts = [];
      for (const post of posts) {
        const spottedUTC = DateTime.fromISO(post.spottedUTC, { zone: 'UTC' });
        const spottedRezoned = spottedUTC.setZone(post.timezone);

        if (dateUTC && !DateTime.fromISO(dateUTC, { zone: 'UTC' }).hasSame(spottedRezoned, 'day')) {
          continue;
        }
        if (minTimeUTC && maxTimeUTC) {
          const min = parseInt(DateTime.fromISO(minTimeUTC, { zone: 'UTC' }).toFormat('HHmmss'));
          const max = parseInt(DateTime.fromISO(maxTimeUTC, { zone: 'UTC' }).toFormat('HHmmss'));
          const t = parseInt(spottedRezoned.toFormat('HHmmss'));
          if (t < min || t > max) {
            continue;
          }
        }
        if (hasImage != null) {
          if (hasImage === true) {
            if (!post.imageKeys || post.imageKeys.length === 0) {
              continue;
            }
          } else {
            console.log("looking for posts with no image");
            if (post.imageKeys && post.imageKeys.length > 0) {
              continue;
            }
          }
        }
        filteredPosts.push(post);
      }
      posts = filteredPosts;
    }

    for (const post of posts) {
      const imageUrls = [];

      if (post.imageKeys != null) {
        for (const imageKey of post.imageKeys) {
          const url = await getSignedUrl(this.s3Client, new s3.GetObjectCommand({
            Bucket: 'florafauna-images',
            Key: imageKey,
          }), { expiresIn: 3600 });
          imageUrls.push(url);
        }
      }

      post.imageUrls = imageUrls;
      delete post.imageKeys;
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

  async incrementConfirmed(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    post.confirmedCount += 1;

    await this.db.collection('posts').updateOne({ id }, { $set: post });
    const savedPost = await this.db.collection('posts').findOne({ id });

    if (!savedPost) {
      return -1;
    }

    return savedPost.confirmedCount;
  }

  async decrementConfirmed(_, { id }) {
    const post = await this.db.collection('posts').findOne({ id });
    if (post.confirmedCount > 0) {
      post.confirmedCount -= 1;
    }

    await this.db.collection('posts').updateOne({ id }, { $set: post });
    const savedPost = await this.db.collection('posts').findOne({ id });

    if (!savedPost) {
      return -1;
    }

    return savedPost.confirmedCount;
  }
}

// mustbeSignedIn to make sure that if not signed in, user can only see posts, no mutations.
module.exports = {
  Controller,
};
