import React from 'react';
import {
  Glyphicon, Modal, Form, FormGroup, FormControl, ControlLabel,
  Button, ButtonToolbar, Tooltip, OverlayTrigger,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import graphQLFetch from './graphQLFetch.js';
import DateInput from './DateInput.jsx';

// This function wraps file reader in a promise and translates the file into base64 for upload.
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
    const dateTimeObj = DateTime.now();
    const timezone = `UTC${dateTimeObj.offset / 60}`;
    const date = dateTimeObj.toUTC().toString();
    this.state = {
      showing: false,
      uploadedImages: [],
      date,
      timezone,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onChangeDate(e) {
    // e is a Moment object so just format it.
    const formattedDate = e.format('MMMM DD YYYY, HH:mm:ss');
    const dateISO = (new Date(formattedDate)).toISOString();
    const dateTimeObj = DateTime.fromISO(dateISO);
    const timezone = `UTC${dateTimeObj.offset / 60}`;
    const date = dateTimeObj.toUTC().toString();
    this.setState({ date, timezone });
  }

  // adds each uploaded file to the list of files
  onFileChange(e) {
    e.preventDefault();
    const { files } = e.target;
    const { uploadedImages } = this.state;
    this.setState({ uploadedImages: [...uploadedImages, files[0]] });
  }

  showModal() {
    const dateTimeObj = DateTime.now();
    const timezone = `UTC${dateTimeObj.offset / 60}`;
    const date = dateTimeObj.toUTC().toString();
    this.setState({ showing: true, timezone, date });
  }

  hideModal() {
    const { closeNewMarker } = this.props;
    this.setState({ showing: false, uploadedImages: [] });
    closeNewMarker();
  }

  // Runs list of files through base64 reader (readFile()); returns array of translated files
  // eslint-disable-next-line consistent-return
  async handleUpload() {
    const { uploadedImages } = this.state;
    const arr = [];
    if (uploadedImages != null || uploadedImages.length >= 1) {
      // eslint-disable-next-line no-restricted-syntax
      for (const image of uploadedImages) {
        // eslint-disable-next-line no-await-in-loop
        const encoded = await readFile(image);
        if (encoded) {
          arr.push(encoded);
        }
      }
      return arr;
    }
  }

  // Handles submission of inputs for adding a new post.
  async handleSubmit(e) {
    e.preventDefault();
    const { date, timezone } = this.state;
    const { user, location } = this.props;

    const encodedImages = await this.handleUpload(); // base64 encoded images

    const form = document.forms.postAdd;
    const post = {
      title: form.title.value,
      sightingType: form.sightingType.value,
      authorId: user.id, // TODO replace hardcoded ID with actual user.id
      spottedUTC: date,
      timezone,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      images: encodedImages,
      description: form.description.value,
    };

    const query = `mutation postAdd($post: PostInput!) {
      postAdd(post: $post) {
        id
        title
        sightingType
        authorId
        createdUTC
        spottedUTC
        timezone
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
      const { changeRefresh } = this.props;
      changeRefresh(true); // set refresh
      this.hideModal();
      showSuccess('Added new post successfully');
    }
  }

  render() {
    const { showing, date } = this.state;
    const { user, location } = this.props;

    const { uploadedImages } = this.state;

    return (
      <React.Fragment>
        <Button disabled={!user.signedIn} onClick={this.showModal}>
          <OverlayTrigger
            placement="left"
            delayShow={1000}
            overlay={<Tooltip id="create-issue">New Sighting</Tooltip>}
          >
            <Glyphicon glyph="plus" />
          </OverlayTrigger>
        </Button>
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
                <ControlLabel>Location</ControlLabel>
                <FormControl.Static>
                  Latitude:
                  {' '}
                  {location.lat}
                  {' '}
                  Longitude:
                  {' '}
                  {location.lng}
                </FormControl.Static>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Date Spotted</ControlLabel>
                <div align="center">
                  <DateInput
                    value={date}
                    input={false}
                    onChange={this.onChangeDate}
                    align="center"
                  />
                </div>

                <FormControl.Feedback />
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

export default PostAddNavItem;
