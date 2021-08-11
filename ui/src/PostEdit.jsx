import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Col,
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ButtonToolbar,
  Button,
  Alert,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import UserContext from './UserContext.js';
import DateInput from './DateInput.jsx';

class PostEdit extends React.Component {
  static async fetchData(match, search, showError) {
    const query = `query post($id:String!) {
      post(id: $id) {
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

    const { params: { id } } = match;
    const result = await graphQLFetch(query, { id }, showError);
    return result;
  }

  constructor() {
    super();
    const post = store.initialData ? store.initialData.post : null;
    delete store.initialData;
    this.state = {
      post,
      invalidFields: {},
      showingValidation: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
  }

  componentDidMount() {
    const { post } = this.state;
    if (post == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id } } } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }

  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState(prevState => ({
      post: { ...prevState.post, [name]: value },
    }));
  }

  onChangeDate(event) {
    // date string formatted from moment (used by dateTime module)
    const dateFromCal = event.format('MMMM DD YYYY, HH:mm:ss');
    const dateISO = (new Date(dateFromCal)).toISOString();
    const dateTimeObj = DateTime.fromISO(dateISO);
    const date = dateTimeObj.toUTC().toString(); // format that DB needs
    this.setState(prevState => ({
      post: { ...prevState.post, spottedUTC: date },
    }));
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { post, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    console.log(post.spottedUTC);

    const query = `mutation postUpdate(
      $id: String!
      $changes: PostUpdateInput!
    ) {
      postUpdate(
        id: $id
        changes: $changes
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

    // TODO: For post updates -- would users be allowed to change location data? May need to remove
    const {
      id, createdUTC, timezone, authorId, location, imageUrls, ...changes
    } = post;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(
      query, { changes, id }, showError,
    );
    if (data) {
      this.setState({ post: data.postUpdate });
      showSuccess('Updated post successfully');
    }
  }

  async loadData() {
    const { match, showError } = this.props;
    const data = await PostEdit.fetchData(match, null, showError);
    this.setState({ post: data ? data.post : {}, invalidFields: {} });
  }

  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  render() {
    const { post } = this.state;
    if (post == null) return null;

    const { post: { id } } = this.state;
    const { match: { params: { id: propsId } } } = this.props;
    if (id == null) {
      if (propsId != null) {
        return <h3>{`Post with ID ${propsId} not found.`}</h3>;
      }
      return null;
    }

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    const user = this.context;

    const timeZone = post.timezone;
    // convert to given timezone
    const createdDateTime = DateTime.fromISO(new Date(post.createdUTC).toISOString(),
      { zone: 'UTC' })
      .setZone(timeZone);
    const created = createdDateTime.toLocaleString(DateTime.DATETIME_FULL);


    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>{`Editing post: ${id}`}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Title</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  size={50}
                  name="title"
                  value={post.title}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Created</Col>
              <Col sm={9}>
                <FormControl.Static>
                  {created}
                </FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>SpottedUTC</Col>
              <DateInput
                name="spottedUTC"
                value={post.spottedUTC}
                input={false}
                onChange={this.onChangeDate}
              />
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Location</Col>
              <Col sm={9}>
                <FormControl.Static>
                  Latitude:
                  {' '}
                  {post.location.lat}
                  {' '}
                  Longitude:
                  {' '}
                  {post.location.lng}
                </FormControl.Static>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Sighting Type</Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="sightingType"
                  value={post.sightingType}
                  onChange={this.onChange}
                >
                  <option value="ANIMAL">Animal</option>
                  <option value="PLANT">Plant</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Description</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  tag="textarea"
                  rows={4}
                  cols={50}
                  name="description"
                  value={post.description}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                <ButtonToolbar>
                  <Button
                    disabled={!user.signedIn}
                    bsStyle="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
                  <LinkContainer to="/posts">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={9}>{validationMessage}</Col>
            </FormGroup>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </Panel.Footer>
      </Panel>
    );
  }
}

PostEdit.contextType = UserContext;
const PostEditWithToast = withToast(PostEdit);
PostEditWithToast.fetchData = PostEdit.fetchData;
export default PostEditWithToast;
