import React from 'react';
import {
  NavItem, Glyphicon, Modal, Form, FormGroup, FormControl, ControlLabel, Col,
  Button, ButtonToolbar, Tooltip, OverlayTrigger, Alert,
} from 'react-bootstrap';
// import graphQLFetch from './graphQLFetch.js';
import DateInput from './DateInput.jsx';
import withToast from './withToast.jsx';


class PostAddNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      invalidFields: {},
      showingValidation: false,
      date: '',
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  onChangeDate(e, dateVal) {
    const { value: textValue } = e.target;
    const value = dateVal === undefined ? textValue : dateVal;
    this.setState({ date: value });
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

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { invalidFields, date } = this.state;
    if (Object.keys(invalidFields).length !== 0) return; // keep from submitting if validation fails

    // TODO replace hardcoded ID with actual user.id
    const { user } = this.props; // attempt to save user's name for post
    const form = document.forms.postAdd;
    const post = {
      title: form.title.value,
      sightingType: form.sightingType.value,
      authorId: 1,
      owner: user.name, // schema needs to add this to post and post input types
      description: form.description.value,
      location: form.location.value, // placeholder for now
      created: new Date(new Date().getTime()),
      spotted: date,
      images: null,
    };

    console.log(post);
    this.hideModal();

    // need to add some code here to handle images

    // const query = `mutation postAdd($post: PostInputs!) {
    //   postAdd(post: $post) {
    //     id
    //     title
    //     sightingType
    //     authorId
    //     owner
    //     created
    //     spotted
    //     images
    //     description
    //   }
    //  }`;
    // const { showSuccess, showError } = this.props;
    // const data = await graphQLFetch(query, { post }, showError);
    // if (data) {
    //   this.hideModal();
    //   showSuccess('Added new post successfully');
    // }
  }

  render() {
    const { showing } = this.state;
    const { user } = this.props;

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;

    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    return (
      <React.Fragment>
        <NavItem disabled={!user.signedIn} onClick={this.showModal}>
          <OverlayTrigger
            placement="left"
            delayShow={1000}
            overlay={<Tooltip id="create-issue">Create Issue</Tooltip>}
          >
            <Glyphicon glyph="plus" />
          </OverlayTrigger>
        </NavItem>
        <Modal keyboard show={showing} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Sighting Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form name="postAdd">
              <FormGroup>
                <ControlLabel>Post Title</ControlLabel>
                <FormControl name="title" autoFocus />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Sighting Type</ControlLabel>
                <FormControl name="sightingType" componentClass="select" placeholder="Animal">
                  <option value="Animal">Animal</option>
                  <option value="Plant">Plant</option>
                </FormControl>
              </FormGroup>
              <FormGroup controlId="formControlsFile">
                <ControlLabel>Sighting image upload</ControlLabel>
                <FormControl type="file" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Sighting Description</ControlLabel>
                <FormControl
                  tag="textarea"
                  rows={4}
                  cols={50}
                  name="description"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Location</ControlLabel>
                <FormControl name="location" />
              </FormGroup>
              <FormGroup validationState={invalidFields.spotted ? 'error' : null}>
                <ControlLabel>Date Spotted</ControlLabel>
                <FormControl
                  componentClass={DateInput}
                  onValidityChange={this.onValidityChange}
                  name="spotted"
                  onChange={this.onChangeDate}
                />
                <FormControl.Feedback />
              </FormGroup>
              <FormGroup>
                <Col smOffset={3} sm={9}>{validationMessage}</Col>
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                type="button"
                bsStyle="primary"
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
              <Button bsStyle="link" onClick={this.hideModal}>Cancel</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}

export default withToast(PostAddNavItem);
