import React from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  MenuItem,
  Glyphicon,
  Grid,
  Col, NavItem,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import PostAddNavItem from './PostAddNavItem.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import Contents from './Contents.jsx';
import Search from './Search.jsx';
import UserContext from './UserContext.js';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';

function NavBar({ user, onUserChange }) {
  return (
    <Navbar fluid>
      <Navbar.Header>
        <LinkContainer exact to="/">
          <NavItem>
            <Navbar.Brand>Flora and Fauna Sighting</Navbar.Brand>
          </NavItem>
        </LinkContainer>
      </Navbar.Header>
      <Col sm={5}>
        <Navbar.Form>
          <Search />
        </Navbar.Form>
      </Col>
      <Nav pullRight>
        <PostAddNavItem user={user} />
        <SignInNavItem user={user} onUserChange={onUserChange} />

        <NavDropdown
          id="user-dropdown"
          title={<Glyphicon glyph="option-vertical" />}
          noCaret
        >
          <LinkContainer to="/about">
            <MenuItem>About</MenuItem>
          </LinkContainer>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

export default class Page extends React.Component {
  static async fetchData(cookie) {
    const query = `query { user {
      signedIn givenName
    }}`;
    const data = await graphQLFetch(query, null, null, cookie);
    return data;
  }

  constructor(props) {
    super(props);
    const user = store.userData ? store.userData.user : null;
    delete store.userData;
    this.state = { user };
    this.onUserChange = this.onUserChange.bind(this);
  }

  async componentDidMount() {
    const { user } = this.state;
    if (user == null) {
      const data = await Page.fetchData();
      this.setState({ user: data.user });
    }
  }

  onUserChange(user) {
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    if (user == null) return null;
    return (
      <div>
        <NavBar user={user} onUserChange={this.onUserChange} />
        <Grid fluid>
          <UserContext.Provider value={user}>
            <Contents />
          </UserContext.Provider>
        </Grid>
      </div>
    );
  }
}
