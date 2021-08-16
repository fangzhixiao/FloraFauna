import React from 'react';
import {
  Button, Modal,
  Col, Panel,
} from 'react-bootstrap';
import withToast from './withToast.jsx';
import graphQLFetch from './graphQLFetch.js';
import UserContext from './UserContext.js';
import PostTable from './PostTable.jsx';

/**
 * This component should only be showing all posts for now, back end lacks a user.js
 */
class Profile extends React.Component {
  // props in this case would be passing in the currently signed in user
  constructor(props) {
    super(props);
    this.state = {
      posts: null,
      showing: false,
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.restorePost = this.restorePost.bind(this);
  }

  componentDidMount() {
    const { posts } = this.state;

    if (posts == null) this.loadData();
  }

  async loadData() {
    const query = `query postList(
      $authorId: String
      ) {
        postList(
          authorId: $authorId
      ) {
        id
        title
        sightingType
        authorId
        createdUTC 
        spottedUTC
        timezone
        location {
          lat lng
          }
        imageUrls
        description 
        comments {
          commenterId content createdUTC
        }
      }
    }`;

    const user = this.context;
    const { id } = user;

    const data = await graphQLFetch(query, { authorId: id }, this.showError);
    if (data) {
      this.setState({
        posts: data.postList,
      });
    }
  }

  async deletePost(index) {
    const query = `mutation postDelete($id: String!) {
      postDelete(id: $id)
    }`;

    const { posts } = this.state;
    const { onPostsChange } = this.props;
    const { showSuccess, showError } = this.props;
    const { id, title } = posts[index];

    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.postDelete) {
      onPostsChange(true);
      this.setState((prevState) => {
        const newList = [...prevState.posts];
        newList.splice(index, 1);
        return { posts: newList };
      });
      const undoMessage = (
        <span>
          {`Deleted post ${id}:${title} successfully.`}
          <Button
            bsStyle="link"
            onClick={() => {
              this.restorePost(id, title);
            }}
          >
            UNDO
          </Button>
        </span>
      );
      // this.showSuccess(undoMessage);
      showSuccess(undoMessage);
    } else {
      await this.loadData();
    }
  }

  async restorePost(id, title) {
    const query = `mutation postRestore($id: String!) {
      postRestore(id: $id)
    }`;
    const data = await graphQLFetch(query, { id }, this.showError);
    if (data) {
      const { onPostsChange, showSuccess } = this.props;
      onPostsChange(true);
      showSuccess(`Post ${id}:${title} restored successfully.`);
      await this.loadData();
    }
  }

  async showModal() {
    await this.loadData();
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  render() {
    const { posts, showing } = this.state;
    if (posts == null) return null;
    const user = this.context;


    // TODO: nice to have: Location as town/state
    return (
      <React.Fragment>
        <Button onClick={this.showModal}>
          View Profile
        </Button>
        <Modal keyboard show={showing} onHide={this.hideModal} bsSize="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Col>
              <Panel>
                <Panel.Heading>
                  <Panel.Title>User Info</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  Name:
                  {' '}
                  {user.givenName}
                  <br />
                  Email:
                  {' '}
                  {user.email}
                </Panel.Body>
              </Panel>
            </Col>
            <Col>
              <PostTable
                posts={posts}
                deletePost={this.deletePost}
              />
            </Col>
          </Modal.Body>
        </Modal>
      </React.Fragment>
    );
  }
}

Profile.contextType = UserContext;
const ProfileWithToast = withToast(Profile);
export default ProfileWithToast;
