import React from 'react';
import {
  Modal, FormGroup, FormControl, ControlLabel, Alert, Col, Button, Carousel, Row,
} from 'react-bootstrap';
import withToast from './withToast.jsx';
import graphQLFetch from './graphQLFetch.js';
import TextInput from './TextInput.jsx';
import UserContext from './UserContext.js';

class Profile extends React.Component {
  // props in this case would be passing in the post object from clicking on a map marker
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }


  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }


  render() {
    const { showing } = this.state;
    const { post } = this.props;

    const { user } = this.context;

    // TODO: Location will need to be converted to town/state?
    return (
      <React.Fragment>
        <Modal keyboard showing={showing} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {user.givenName}
              {' '}
              Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            // TODO Add table of posts here
          </Modal.Body>
        </Modal>
      </React.Fragment>
    );
  }
}

Profile.contextType = UserContext;
export default withToast(Profile);
