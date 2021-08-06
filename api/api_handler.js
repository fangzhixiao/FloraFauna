const fs = require('fs');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const s3 = require('@aws-sdk/client-s3');
const GraphQLDate = require('./graphql_date.js');
const about = require('./about.js');
const auth = require('./auth.js');
const db = require('./db.js');
const post = require('./post.js');
const { mustBeSignedIn } = require('./auth');

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

async function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';

  console.log('CORS setting:', enableCors);

  let cors;
  if (enableCors) {
    const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
    const methods = 'POST';
    cors = { origin, methods, credentials: true };
  } else {
    cors = 'false';
  }

  const database = await db.connect();
  const postController = new post.Controller({
    db: database,
    s3Client: new s3.S3Client({ region: 'us-west-2' }),
  });
  const resolvers = {
    Query: {
      about: about.getMessage,
      user: auth.resolveUser,
      postList: postController.list,
      post: postController.get,
    },
    Mutation: {
      setAboutMessage: about.setMessage,
      postAdd: postController.add,
      postUpdate: postController.update,
      // postDelete: post.delete,
      // postRestore: post.restore,
    },
    GraphQLDate,
  };

  const server = new ApolloServer({
    typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
    resolvers,
    context: getContext,
    formatError: (error) => {
      console.log(error);
      return error;
    },
  });

  server.applyMiddleware({ app, path: '/graphql', cors });
}

module.exports = { installHandler };
