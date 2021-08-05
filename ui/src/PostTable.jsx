import React from 'react';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Button, Glyphicon, Tooltip, OverlayTrigger, Table,
} from 'react-bootstrap';

import UserContext from './UserContext.js';
import Post from './Post.jsx';

class PostRowPlain extends React.Component {
  render() {
    const {
      post, deletePost, index,
    } = this.props;

    const user = this.context;
    const disabled = !user.signedIn;

    const editTooltip = (
      <Tooltip id="close-tooltip" placement="top">Edit Post</Tooltip>
    );

    const deleteTooltip = (
      <Tooltip id="delete-tooltip" placement="top">Delete Post</Tooltip>
    );

    function onDelete(e) {
      e.preventDefault();
      deletePost(index);
    }

    const tableRow = (
      <tr>
        <td>
          <Post post={post} />
        </td>
        <td>{post.title}</td>
        <td>{post.sightingType}</td>
        <td>{post.created.toLocaleDateString()}</td>
        <td>{post.spotted.toLocaleDateString()}</td>
        <td>{post.spotted.toLocaleTimeString()}</td>
        <td>
          <LinkContainer to="/">
            <OverlayTrigger delayShow={1000} overlay={editTooltip}>
              <Button bsSize="xsmall" onClick={() => { window.open(`/edit/${post.id}`, '_blank'); }}>
                <Glyphicon glyph="edit" />
              </Button>
            </OverlayTrigger>
          </LinkContainer>
          {' '}
          <OverlayTrigger delayShow={1000} overlay={deleteTooltip}>
            <Button disabled={disabled} bsSize="xsmall" onClick={onDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );

    return tableRow;
  }
}

PostRowPlain.contextType = UserContext;
const PostRow = withRouter(PostRowPlain);
delete PostRow.contextType;

export default function PostTable({ posts, deletePost }) {
  const postRows = posts.map((post, index) => (
    <PostRow
      key={post.id}
      post={post}
      deletePost={deletePost}
      index={index}
    />
  ));

  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>View Post</th>
          <th>Title</th>
          <th>Sighting Type</th>
          <th>Date Post Created</th>
          <th>Date Spotted</th>
          <th>Time Spotted</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {postRows}
      </tbody>
    </Table>
  );
}
