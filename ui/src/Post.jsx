import React from 'react';
import {
  Modal, FormGroup, FormControl, ControlLabel, Alert,
  Col, Button, Carousel, Row, ListGroup, ListGroupItem,
} from 'react-bootstrap';
import withToast from './withToast.jsx';
import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';
import UserContext from './UserContext.js';

class Post extends React.Component {
  // props in this case would be passing in the post object from clicking on a map marker
  constructor(props) {
    super(props);
    const { post } = props;
    this.state = {
      showing: false,
      comments: post.comments,
      invalidFields: {},
      showingValidation: false,
      newComment: '',
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.addComment = this.addComment.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event, naturalValue) {
    const { value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState({ newComment: value });
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }


  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  async addComment(e) { // submit comment
    e.preventDefault();
    this.showValidation();
    const { invalidFields, newComment } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;
    const user = this.context;

    const comment = {
      commenter: user.givenName,
      content: newComment,
      created: new Date(new Date().getTime()),
    };

    const { post } = this.props;

    if (post.comments == null) {
      post.comments = [];
      post.comments.push(comment);
    }

    const query = `mutation postUpdate(
      $id: String!
      $changes: PostUpdateInput!
    ) {
      postUpdate(
        id: $id
        changes: $changes
      ) {
        id
        comments {
          commenter content created
        }        
      }
    }`;

    const {
      id, created, spotted, authorId, location, ...changes
    } = post;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(
      query, { changes, id }, showError,
    );
    if (data) {
      this.setState((prevState) => {
        if (prevState.comments == null) {
          const c = [];
          c.push(comment);
          return c;
        }
        const newList = [...prevState.comments];
        newList.push(comment);
        return { comments: newList };
      });
      showSuccess('Comment added successfully');
    }
  }

  render() {
    const { showing, comments } = this.state;
    const { post } = this.props;
    const user = this.context;

    const { invalidFields, showingValidation, newComment } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    // TODO: image from DB should be a URL see google doc for reference
    function DisplayImages() {
      const { title, imageKeys } = post;
      if (imageKeys == null) {
        return (
          <div align="center">No Images to Display</div>
        );
      }
      const display = imageKeys.map((image, index) => (
        <Carousel.Item>
          {/* eslint-disable-next-line react/no-array-index-key */}
          <img src={imageKeys} key={index} alt={title} />
        </Carousel.Item>
      ));

      return (
        <Carousel>
          {display}
        </Carousel>
      );
    }

    function DisplayComments() {
      if (comments == null) {
        return (
          <div align="center">This post has no comments...</div>
        );
      }

      const commentList = comments.map((comment) => {
        const { commenter, created, content } = comment;
        return (
          <ListGroupItem key={`${commenter}${created}`}>
            <Row>
              <Col lg={5}>
                {commenter}
              </Col>
              <Col lg={5}>
                {created.toLocaleString()}
              </Col>
            </Row>
            <Row>
              {content}
            </Row>
          </ListGroupItem>
        );
      });
      return (
        <ListGroup>
          {commentList}
        </ListGroup>
      );
    }


    // TODO: Location will need to be converted to town/state?
    // TODO: enable send comment when functionality is implemented
    return (
      <React.Fragment>
        <Button onClick={this.showModal}>
          View Post
        </Button>
        <Modal keyboard show={showing} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>{post.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <b> Location: </b>
              {' '}
              Latitude:
              {' '}
              {post.location.lat}
              {' '}
              Longitude:
              {' '}
              {post.location.lng}
            </Row>
            <br />
            <Row><DisplayImages /></Row>
            <Row>
              <br />
              Sighting at:
              {' '}
              {post.spotted.toDateString()}
              {' '}
              {post.spotted.toTimeString()}
            </Row>
            <Row>
              <br />
              Author:
              {' '}
              {post.authorId}
            </Row>
            <Row>
              Sighting Description:
              {' '}
              {post.description}
            </Row>
            <br />
            <Row><DisplayComments /></Row>
          </Modal.Body>
          <Modal.Footer>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Comment: </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  rows={2}
                  cols={50}
                  name="comment"
                  value={newComment}
                  onChange={this.onChange}
                />
              </Col>
              <Col sm={3}>
                <Button
                  disabled={!user.signedIn}
                  bsStyle="primary"
                  type="submit"
                  onClick={this.addComment}
                >
                  Send Comment
                </Button>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={3} sm={9}>{validationMessage}</Col>
            </FormGroup>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

Post.contextType = UserContext;
export default withToast(Post);
