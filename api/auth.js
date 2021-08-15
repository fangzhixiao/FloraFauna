const Router = require('express');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const cors = require('cors');
const uuid = require('uuid');
const db = require('./db.js');


let { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV !== 'production') {
    JWT_SECRET = 'tempjwtsecretfordevonly';
    console.log('Missing env var JWT_SECRET. Using unsafe dev secret');
  } else {
    console.log('Missing env var JWT_SECRET. Authentication disabled');
  }
}

const routes = new Router(); // new router that will be exported
routes.use(bodyParser.json()); // middleware; only JSON doc in endpoints

// allows credentials in cookies to be sent for cross origin requests
const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
routes.use(cors({ origin, credentials: true }));

function getUser(req) {
  const token = req.cookies.jwt;
  if (!token) return { signedIn: false };
  try {
    const credentials = jwt.verify(token, JWT_SECRET);
    return credentials;
  } catch (error) {
    return { signedIn: false };
  }
}


routes.post('/signin',
  async (req, res) => {
    if (!JWT_SECRET) {
      res.status(500).send('Missing JWT_SECRET. Refusing to authenticate');
    }

    const googleToken = req.body.google_token; // get google token from the request body
    if (!googleToken) { // Error handling
      res.status(400).send({ code: 400, message: 'Missing Token' });
      return;
    }
    const client = new OAuth2Client(); // establish OAuth client
    let payload;
    try {
      // Verify token using google auth library
      const ticket = await client.verifyIdToken({ idToken: googleToken });
      payload = ticket.getPayload();
    } catch (error) {
      res.status(403).send('Invalid credentials');
    }
    const { sub: googleId, given_name: givenName, email } = payload;

    const thisDB = await db.connect();
    let user = await thisDB.collection('users').findOne({ googleId });
    if (!user) {
      const userId = uuid.v4();
      user = Object.assign({}, { googleId, id: userId });
      await thisDB.collection('users').insertOne(user);
    }

    const { id } = user;

    const credentials = {
      id, signedIn: true, givenName, email,
    };

    const token = jwt.sign(credentials, JWT_SECRET);
    res.cookie('jwt', token, { httpOnly: true, domain: process.env.COOKIE_DOMAIN });
    res.json(credentials);
  });

routes.post('/signout', async (req, res) => {
  res.clearCookie('jwt', {
    domain: process.env.COOKIE_DOMAIN,
  });
  res.json({ status: 'ok' });
});

routes.post('/user', (req, res) => {
  res.send(getUser(req));
});

// function to make sure only signed in users can CRUD issues etc.
function mustBeSignedIn(resolver) {
  return (root, args, { user }) => {
    if (!user || !user.signedIn) {
      throw new AuthenticationError('You must be signed in');
    }
    return resolver(root, args, { user });
  };
}

function resolveUser(_, args, { user }) {
  return user;
}

module.exports = {
  routes, getUser, mustBeSignedIn, resolveUser,
};
