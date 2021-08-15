const fs = require('fs');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const s3 = require('@aws-sdk/client-s3');
const Router = require("express");
const corsf = require('cors');

const about = require('./about.js');
const auth = require('./auth.js');
const db = require('./db.js');
const post = require('./post.js');
const { mustBeSignedIn } = require('./auth.js');
const user = require("./user.js");

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

let { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV !== 'production') {
    JWT_SECRET = 'tempjwtsecretfordevonly';
    console.log('Missing env var JWT_SECRET. Using unsafe dev secret');
  } else {
    console.log('Missing env var JWT_SECRET. Authentication disabled');
  }
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
  const userController = new user.Controller({
    db: database,
    jwtSecret: JWT_SECRET,
  });
  const routes = new Router();
  const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';

  routes.use(Router.json());
  routes.use(corsf({ origin, credentials: true }));
  routes.post("/signin", userController.signIn);
  routes.post("/signout", userController.signOut);
  routes.post("/user", userController.getUserByToken);

  app.use('/auth', routes);

  const resolvers = {
    Query: {
      about: about.getMessage,
      user: userController.getUserById,
      postList: postController.list,
      post: postController.get,
    },
    Mutation: {
      setAboutMessage: about.setMessage,
      postAdd: mustBeSignedIn(postController.add),
      postUpdate: mustBeSignedIn(postController.update),
      postDelete: mustBeSignedIn(postController.remove),
      postRestore: mustBeSignedIn(postController.restore),
    },
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
