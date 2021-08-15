const { AuthenticationError } = require('apollo-server-express');

// function to make sure only signed in users can CRUD issues etc.
function mustBeSignedIn(resolver) {
  return (root, args, { user }) => {
    if (!user || !user.signedIn) {
      throw new AuthenticationError('You must be signed in');
    }
    return resolver(root, args, { user });
  };
}

function getUser(req) {
    const token = req.cookies.jwt;
    if (!token) return { signedIn: false , id: '' };
    try {
        const credentials = jwt.verify(token, JWT_SECRET);
        return credentials;
    } catch (error) {
        return { signedIn: false };
    }
}
module.exports = {
  mustBeSignedIn, getUser
};
