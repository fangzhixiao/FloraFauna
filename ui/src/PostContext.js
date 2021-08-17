import React from 'react';

const PostContext = React.createContext({
  refresh: false,
  changeRefresh: () => {},
});
export default PostContext;
