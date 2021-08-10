import React from 'react';
import {
  NavItem, Glyphicon, Modal, Form, FormGroup, FormControl, ControlLabel,
  Button, ButtonToolbar, Tooltip, OverlayTrigger,
} from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';
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
    this.state = {
      showing: false,
      uploadedImages: [],
      date: new Date(new Date().getTime()),
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  onChangeDate(e) {
    // e is a Moment object so just format it.
    this.setState({ date: e.format('MMMM DD YYYY, HH:mm:ss') });
  }

  // adds each uploaded file to the list of files
  onFileChange(e) {
    e.preventDefault();
    const { files } = e.target;
    const { uploadedImages } = this.state;
    this.setState({ uploadedImages: [...uploadedImages, files[0]] });
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
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
    const { date } = this.state;

    const encodedImages = await this.handleUpload(); // base64 encoded images

    const form = document.forms.postAdd;
    const post = {
      title: form.title.value,
      sightingType: form.sightingType.value,
      authorId: 1, // TODO replace hardcoded ID with actual user.id
      created: new Date(new Date().getTime()),
      spotted: date,
      location: {
        lat: form.latitude.value,
        lng: form.longitude.value,
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
    const { showing, date } = this.state;
    const { user } = this.props;

    const { uploadedImages } = this.state;

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
              <FormGroup>
                <ControlLabel>Date Spotted</ControlLabel>
                <DateInput
                  value={date}
                  input={false}
                  onChange={this.onChangeDate}
                />
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

export default withToast(PostAddNavItem);
