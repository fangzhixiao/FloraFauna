import React from 'react';
import {
  NavItem, Glyphicon, Modal, Form, FormGroup, FormControl, ControlLabel, Col,
  Button, ButtonToolbar, Tooltip, OverlayTrigger, Alert,
} from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import DateInput from './DateInput.jsx';
import withToast from './withToast.jsx';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result
        .replace('data:', '')
        .replace(/^.+,/, '');
      resolve(base64String);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


class PostAddNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      uploadedImages: [],
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
    this.onFileChange = this.onFileChange.bind(this);
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

  // adds each uploaded file to the list of files
  onFileChange(e) {
    e.preventDefault();
    const { files } = e.target;
    const { uploadedImages } = this.state;
    this.setState({ uploadedImages: [...uploadedImages, files[0]] });
  }

  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  // TODO: encode images into base64 (async) and push to db
  // https://pqina.nl/blog/convert-a-file-to-a-base64-string-with-javascript/
  // eslint-disable-next-line consistent-return
  async handleUpload() {
    const { uploadedImages } = this.state;
    const arr = [];
    if (uploadedImages != null || uploadedImages.length >= 1) {
      // await Promise.all(uploadedImages.map(async (image) => {
      //   const encoded = await readFile(image);
      //   console.log(encoded);
      //   this.setState({ imageBaseEncoded: [...imageBaseEncoded, encoded] });
      // }));
      // eslint-disable-next-line no-restricted-syntax
      for (const image of uploadedImages) {
        // eslint-disable-next-line no-await-in-loop
        const encoded = await readFile(image);
        arr.push(encoded);
        // this.setState({ imageBaseEncoded: [...imageBaseEncoded, encoded] });
      }
      console.log(arr);
      return arr;
    }
  }

  // TODO: having problems with images pushing -- could not load credentials from any providers
  // Maybe have to config it:
  // https://stackoverflow.com/questions/56152697/could-not-load-credentials-from-any-providers-when-attempting-upload-to-aws-s3
  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { invalidFields, date, imageBaseEncoded } = this.state;
    if (Object.keys(invalidFields).length !== 0) return; // keep from submitting if validation fails

    const encodedImages = await this.handleUpload();

    // TODO replace hardcoded ID with actual user.id
    const form = document.forms.postAdd;
    const post = {
      title: form.title.value,
      sightingType: form.sightingType.value,
      authorId: 1,
      created: new Date(new Date().getTime()),
      spotted: date,
      location: {
        lat: form.latitude.value,
        lng: form.longitude.value,
      },
      images: encodedImages,
      description: form.description.value,
    };


    console.log(post.images);

    const query = `mutation postAdd($post: PostInput!) {
      postAdd(post: $post) {
        id
        title
        sightingType
        authorId
        created
        spotted
        imageUrls
        description
        location {
          lat lng
        }
      }
     }`;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { post }, showError);
    if (data) {
      this.hideModal();
      showSuccess('Added new post successfully');
    }
  }

  render() {
    const { showing } = this.state;
    const { user } = this.props;

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;

    const { uploadedImages } = this.state;

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
                  <option value="ANIMAL">Animal</option>
                  <option value="PLANT">Plant</option>
                </FormControl>
              </FormGroup>
              <FormGroup controlId="formControlsFile">
                <ControlLabel>Sighting image upload</ControlLabel>
                <FormControl type="file" accept=".jpg,.jpeg,.png" onChange={this.onFileChange} />
                {uploadedImages.map((img, index) => {
                  const fileName = img.name;
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <p key={`${fileName}${img.lastModified}${index}`}>{fileName}</p>
                  );
                })}
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
                <ControlLabel>Latitude</ControlLabel>
                <FormControl name="latitude" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Longitude</ControlLabel>
                <FormControl name="longitude" />
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
