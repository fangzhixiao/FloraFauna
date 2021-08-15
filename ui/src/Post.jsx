import React from 'react';
import {
  Modal, FormGroup, FormControl, ControlLabel, Alert,
  Col, Button, Carousel, Row, ListGroup, ListGroupItem, Panel, Tooltip, OverlayTrigger,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import withToast from './withToast.jsx';
import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';
import UserContext from './UserContext.js';

const btn1 = {
  backgroundColor: '#F0F8FF',
  padding: '10px',
  fontsize: '28px',
};

class Post extends React.Component {
  // props in this case would be passing in the post object from clicking on a map marker

  constructor(props) {
    super(props);
    const { post } = this.props;
    this.state = {
      showing: false,
      post,
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

  async loadData() {
    const { showError } = this.props;
    const { post } = this.state;
    const { id } = post;
    const query = `query post($id: String!){
      post(id: $id){
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

    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      this.setState({ imageUrls: data.post.imageUrls });
    }
  }

  async showModal() {
    await this.loadData();
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
    const { invalidFields, newComment, post } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;
    const user = this.context;

    const comment = {
      commenter: user.givenName,
      content: newComment,
      createdUTC: new Date(new Date().getTime()),
    };

    if (post.comments == null) {
      post.comments = [];
    }
    post.comments = [...post.comments, comment];

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
          commenter content createdUTC
        }        
      }
    }`;

    const {
      id, createdUTC, spottedUTC, timezone, authorId, location, imageUrls, ...changes
    } = post;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(
      query, { changes, id }, showError,
    );
    if (data) {
      this.setState((prevState) => {
        const updatedPost = prevState.post;
        return { post: updatedPost };
      });
      showSuccess('Comment added successfully');
    }
  }

  render() {
    const { showing, post } = this.state;
    const { imageUrls } = this.state;
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

    const { timezone } = post;
    const spottedDateTime = DateTime.fromISO(new Date(post.spottedUTC).toISOString(),
      { zone: 'UTC' })
      .setZone(timezone);
    const spotted = spottedDateTime.toLocaleString(DateTime.DATETIME_MED);

    // TODO: image from DB should be a URL see google doc for reference
    function DisplayImages() {
      if (imageUrls == null || imageUrls.length === 0) {
        return (
          <div align="center">No Images to Display</div>
        );
      }
      const display = imageUrls.map((image, index) => (
        <Carousel.Item align="center">
          {/* eslint-disable-next-line react/no-array-index-key */}
          <img src={image} key={index} alt={post.title} />
        </Carousel.Item>
      ));

      return (
        <Carousel slide={false}>
          {display}
        </Carousel>
      );
    }

    function DisplayComments() {
      if (post.comments == null) {
        return (
          <div align="center">This post has no comments...</div>
        );
      }

      const commentList = post.comments.map((comment) => {
        const { commenter, createdUTC, content } = comment;
        const createdDateTime = DateTime.fromISO((new Date(createdUTC)).toISOString(),
          { zone: 'UTC' });
        const createdString = createdDateTime.toLocaleString(DateTime.DATETIME_MED);
        return (
          <ListGroupItem key={`${commenter}${createdUTC}`}>
            <Panel>
              <Panel.Body>
                <div align="right">
                  {createdString}
                </div>
                <div align="left">
                  {commenter}
                  <br />
                  {content}
                </div>

              </Panel.Body>
            </Panel>
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

        <OverlayTrigger
            placement="left"
            delayShow={1000}
            overlay={<Tooltip id="details">details</Tooltip>}
        >

        <Button style={btn1} onClick={this.showModal}>
          View Post
        </Button>

        </OverlayTrigger>
        <Modal keyboard show={showing} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {post.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Panel>
              <Panel.Body>
                <b> Location: </b>
                {' '}
                Latitude:
                {' '}
                {post.location.lat}
                {' '}
                Longitude:
                {' '}
                {post.location.lng}
                <br />
                <b>Sighting Date:</b>
                {' '}
                {spotted}
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Body>
                <DisplayImages />
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Heading>
                Description
              </Panel.Heading>
              <Panel.Body>
                Author:
                {' '}
                {post.authorId}
                <br />
                {post.description}
              </Panel.Body>
            </Panel>
            <br />
            <Row><DisplayComments /></Row>
          </Modal.Body>
          <Modal.Footer>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4} lg={2} med={3}>Comment: </Col>
              <Col sm={9} lg={7} med={8}>
                <FormControl
                  componentClass={TextInput}
                  rows={2}
                  cols={40}
                  name="comment"
                  value={newComment}
                  onChange={this.onChange}
                />
              </Col>
              <Col sm={3} lg={1} med={2}>
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
