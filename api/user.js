const {OAuth2Client} = require("google-auth-library");
const jwt = require("jsonwebtoken");

class Controller {
    constructor(props) {
        this.db = props.db;
        this.jwtSecret = props.jwtSecret;
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
        this.getUserByToken = this.getUserByToken.bind(this);
        this.getUserById = this.getUserById.bind(this);
    }

    async signIn(req, res) {
        if (!this.jwtSecret) {
            res.status(500).send("Missing JWT secret.");
            return;
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
            return;
        }

        // extract user info from google
        const { sub: googleId, given_name: givenName, email  } = payload;

        // check if user already exists in db
        let user = await this.db.collection('users').findOne({ googleId });
        if (!user) {
            const id = uuid.v4();
            user = Object.assign({}, {googleId, id, givenName, email });
            await this.db.collection('users').insertOne(user);
        }

        // formulate object to send back to front end
        const credentials = {
            id: user.id, signedIn: true, givenName, email,
        };

        const token = jwt.sign(credentials, this.jwtSecret);
        res.cookie('jwt', token, { httpOnly: true, domain: process.env.COOKIE_DOMAIN });
        res.json(credentials);
    }

    async signOut(req, res) {
        res.clearCookie('jwt', {
            domain: process.env.COOKIE_DOMAIN,
        });
        res.json({ status: 'ok' });
    }

    async getUserByToken(req, res) {
        const token = req.cookies.jwt;

        if (!token) {
            res.send({ signedIn: false });
            return;
        }

        try {
            const credentials =  jwt.verify(token, JWT_SECRET);
            res.send(credentials);
        } catch (error) {
            res.send({ signedIn: false });
        }
    }

    async getUserById(_, {id}) {
       const user = await this.db.collection('users').findOne({ id });

       if (!user) {
           return null;
       }

       delete user.googleId;
       return user;
    }
}

module.exports = { Controller };
