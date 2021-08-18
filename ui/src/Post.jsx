import React from 'react';
import {
  Modal, FormGroup, FormControl, ControlLabel, Alert,
  Col, Button, Carousel, Row, ListGroup, ListGroupItem,
  Panel, Tooltip, OverlayTrigger, Label, Glyphicon, Badge,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';

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
      author: '',
      invalidFields: {},
      showingValidation: false,
      newComment: '',
      confirmedClick: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.addComment = this.addComment.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onConfirmedChange = this.onConfirmedChange.bind(this);
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

  async onConfirmedChange(e) {
    e.preventDefault();
    const { showError, changeRefresh } = this.props;
    const { confirmedClick, post } = this.state;
    const { id } = post;
    if (confirmedClick === true) {
      const query = `mutation postDecrementConfirmed($id: String!) {
       postDecrementConfirmed(id: $id)
     }`;
      const data = await graphQLFetch(
        query, { id }, showError,
      );
      if (data) {
        changeRefresh(true);
        this.setState({ confirmedClick: false });
        this.setState({ count: data.postDecrementConfirmed });
      }
    } else {
      const query = `mutation postIncrementConfirmed($id: String!) {
       postIncrementConfirmed(id: $id)
     }`;
      const data = await graphQLFetch(
        query, { id }, showError,
      );
      if (data) {
        changeRefresh(true);
        this.setState({ confirmedClick: true });
        this.setState({ count: data.postIncrementConfirmed });
      }
    }
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
          commenterId content createdUTC
          }
        confirmedCount
        }
      }`;

    const queryUser = `query getAuthor($id: String){ 
    getAuthor(id:$id){
      id givenName email
    }}`;

    const data = await graphQLFetch(query, { id }, showError);

    if (data) {
      this.setState({ imageUrls: data.post.imageUrls });
      this.setState({ count: data.post.confirmedCount });
      const userData = await graphQLFetch(queryUser, { id: data.post.authorId }, showError);
      if (userData != null) {
        if (userData.getAuthor == null) {
          this.setState({ author: 'unknown' });
        } else {
          this.setState({ author: userData.getAuthor.givenName });
        }
      }
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
    const { user } = this.props;

    const comment = {
      commenterId: user.givenName,
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
          commenterId content createdUTC
        }        
      }
    }`;

    const {
      id, createdUTC, timezone, authorId,
      location, imageUrls, confirmedCount, ...changes
    } = post;
    const { showSuccess, showError, changeRefresh } = this.props;
    const data = await graphQLFetch(
      query, { changes, id }, showError,
    );
    if (data) {
      changeRefresh(true);
      this.setState((prevState) => {
        const updatedPost = prevState.post;
        return { post: updatedPost, newComment: '' };
      });
      showSuccess('Comment added successfully');
    }
  }

  render() {
    const {
      showing, post, author, count, confirmedClick,
    } = this.state;
    const { imageUrls } = this.state;
    const { user } = this.props;

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
    const disable = user.id === post.authorId || !user.signedIn;
    const ShowOK = () => {
      if (confirmedClick === true) {
        return (
          <Glyphicon glyph="ok" />
        );
      }
      return null;
    };

    function DisplayImages() {
      if (imageUrls == null || imageUrls.length === 0) {
        return (
          <div align="center">No Images to Display</div>
        );
      }
      const display = imageUrls.map((image, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Carousel.Item align="center" key={`${post.title}${index}`}>
          {/* eslint-disable-next-line react/no-array-index-key */}
          <img src={image} key={`${post.title}${index}`} alt={post.title} />
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
          <ListGroup>
            <ListGroupItem>
              <div align="center"><b>Comments</b></div>
            </ListGroupItem>
            <ListGroupItem>
              <div align="center">This post has no comments.</div>
            </ListGroupItem>
          </ListGroup>

        );
      }

      const commentList = post.comments.map((comment) => {
        const { commenterId, createdUTC, content } = comment;
        const createdDateTime = DateTime.fromISO((new Date(createdUTC)).toISOString(),
          { zone: 'UTC' });
        const createdString = createdDateTime.toLocaleString(DateTime.DATETIME_MED);

        const ListHeader = () => (
          <h5>
            <Label bsStyle="primary">{commenterId}</Label>
            {' | '}
            {createdString}
          </h5>
        );

        return (
          <ListGroupItem
            key={`${commenterId}${createdUTC}`}
          >
            <ListHeader />
            {content}
          </ListGroupItem>
        );
      });
      return (
        <ListGroup>
          <ListGroupItem>
            <div align="center"><b>Comments</b></div>
          </ListGroupItem>
          {commentList}
        </ListGroup>
      );
    }

    // TODO: Location will need to be converted to town/state?
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
                <br />
                <div>
                  <Button disabled={disable} onClick={this.onConfirmedChange}>
                    Confirm Sighting
                    {' '}
                    <ShowOK />
                  </Button>
                  {' '}
                  <Badge>{count}</Badge>

                </div>
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Body>
                <DisplayImages />
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Body>
                <b>Author:</b>
                {' '}
                {author}
                <br />
                <b>Description:</b>
                <br />
                {post.description}
              </Panel.Body>
            </Panel>
            <br />
            <Row>
              <DisplayComments />
            </Row>
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

export default Post;
