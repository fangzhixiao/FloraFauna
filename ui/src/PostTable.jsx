import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import {
  Button, Glyphicon, Tooltip, OverlayTrigger, Table,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import UserContext from './UserContext.js';
import Post from './Post.jsx';
import withToast from './withToast.jsx';

class PostRowPlain extends React.Component {
  render() {
    const {
      post, deletePost, index, showError, showSuccess, onPostsChange,
    } = this.props;

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

    const timeZone = post.timezone;
    // convert to given timezone

    const spottedDateTime = DateTime.fromISO(new Date(post.spottedUTC).toISOString(),
      { zone: 'UTC' })
      .setZone(timeZone);
    const createdDateTime = DateTime.fromISO(new Date(post.createdUTC).toISOString(),
      { zone: 'UTC' })
      .setZone(timeZone);

    const spotted = spottedDateTime.toLocaleString(DateTime.DATETIME_MED);
    const created = createdDateTime.toLocaleString(DateTime.DATETIME_MED);


    const user = this.context;

    const tableRow = (
      <tr>
        <td>
          <Post
            post={post}
            changeRefresh={onPostsChange}
            user={user}
            showError={showError}
            showSuccess={showSuccess}
          />
        </td>
        <td>{post.title}</td>
        <td>{post.sightingType}</td>
        <td>{created}</td>
        <td>{spotted}</td>
        <td>
          <OverlayTrigger disabled={!user.signedIn} delayShow={1000} overlay={editTooltip}>
            <Button bsSize="xsmall">
              <Link to={`/edit/${post.id}`} target="_blank"><Glyphicon glyph="edit" /></Link>
            </Button>
          </OverlayTrigger>
          {' '}
          <OverlayTrigger disabled={!user.signedIn} delayShow={1000} overlay={deleteTooltip}>
            <Button bsSize="xsmall" onClick={onDelete}>
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

function PostTable({
  posts, deletePost, showError, showSuccess, onPostsChange,
}) {
  const postRows = posts.map((post, index) => (
    <PostRow
      key={post.id}
      post={post}
      deletePost={deletePost}
      showSuccess={showSuccess}
      showError={showError}
      onPostsChange={onPostsChange}
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
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {postRows}
      </tbody>
    </Table>
  );
}
const TableWithToast = withToast(PostTable);
export default TableWithToast;
