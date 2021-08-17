import React from 'react';

const UserContext = React.createContext({
  signedIn: false,
  id: '',
});
export default UserContext;
