import React from 'react';
import { withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
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
      post, deletePost, index,
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
    const spottedDateTime = DateTime.fromISO(post.spottedUTC, { zone: 'UTC' })
      .setZone(timeZone);
    const createdDateTime = DateTime.fromISO(post.createdUTC, { zone: 'UTC' })
      .setZone(timeZone);

    const spotted = spottedDateTime.toLocaleString(DateTime.DATETIME_MED);
    const created = createdDateTime.toLocaleString(DateTime.DATETIME_MED);


    const user = this.context;

    const tableRow = (
      <tr>
        <td>
          <Post post={post} />
        </td>
        <td>{post.title}</td>
        <td>{post.sightingType}</td>
        <td>{created.toString()}</td>
        <td>{spotted.toString()}</td>
        <td>
          <LinkContainer to="/">
            <OverlayTrigger disabled={!user.signedIn} delayShow={1000} overlay={editTooltip}>
              <Button bsSize="xsmall" onClick={() => { window.open(`/edit/${post.id}`, '_blank'); }}>
                <Glyphicon glyph="edit" />
              </Button>
            </OverlayTrigger>
          </LinkContainer>
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

function PostTable({ posts, deletePost }) {
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
