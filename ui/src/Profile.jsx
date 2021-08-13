import React from 'react';
import {
  Button, Modal,
  Col, Panel, Glyphicon,
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
      showAlert: 'invisible',
      alertMessage: '',
      alertColor: '',
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.restorePost = this.restorePost.bind(this);
    this.showError = this.showError.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
  }

  componentDidMount() {
    const { posts } = this.state;
    if (posts == null) this.loadData();
  }

  async loadData() {
    const query = `query postList(
      $authorId: Int
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
          commenter content createdUTC
        }
      }
    }`;

    const data = await graphQLFetch(query, {}, this.showError);
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

    const { posts, showAlert } = this.state;
    const { onPostsChange } = this.props;
    const { id, title } = posts[index];
    if (showAlert === 'block') this.setState('none');
    const data = await graphQLFetch(query, { id }, this.showError);
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
              this.closeAlert();
            }}
          >
            UNDO
          </Button>
        </span>
      );
      this.showSuccess(undoMessage);
    } else {
      await this.loadData();
    }
  }

  // write own show error/success alerts just for this page?
  async restorePost(id, title) {
    const query = `mutation postRestore($id: String!) {
      postRestore(id: $id)
    }`;
    const data = await graphQLFetch(query, { id }, this.showError);
    if (data) {
      const {onPostsChange} = this.props;
      onPostsChange(true);
      this.showSuccess(`Post ${id}:${title} restored successfully.`);
      await this.loadData();
    }
  }

  showError(message) {
    this.setState({
      showAlert: 'visible',
      alertColor: '#D9534FFF',
      alertMessage: message,
    });
  }

  showSuccess(message) {
    this.setState({
      showAlert: 'visible',
      alertColor: '#5CB85CFF',
      alertMessage: message,
    });
  }

  closeAlert() {
    this.setState({
      showAlert: 'invisible',
      alertColor: '#fff',
      alertMessage: '',
    });
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
    // const user = this.context;
    const { showAlert, alertColor, alertMessage } = this.state;


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
              <UserContext.Consumer>
                {user => (
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
                )}
              </UserContext.Consumer>

            </Col>
            <Col>
              <PostTable
                posts={posts}
                deletePost={this.deletePost}
              />
            </Col>
          </Modal.Body>
          <Modal.Footer>
            <div
              className={showAlert}
              style={{
                position: 'fixed',
                backgroundColor: { alertColor },
              }}
            >
              {alertMessage}
              <Button bsSize="xsmall" onClick={this.closeAlert}>
                <Glyphicon glyph="remove" />
              </Button>
            </div>
            <br />
          </Modal.Footer>

        </Modal>
      </React.Fragment>
    );
  }
}

// Profile.contextType = UserContext;
const ProfileWithToast = withToast(Profile);
export default ProfileWithToast;
