import React from 'react';
import {
  Navbar,
  Nav,
  NavDropdown,
  MenuItem,
  Glyphicon,
  Grid,
  Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import PostAddNavItem from './PostAddNavItem.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import Contents from './Contents.jsx';
import Search from './Search.jsx';
import UserContext from './UserContext.js';
import PostContext from './PostContext.js';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';

function NavBar({ user, onUserChange, onPostsChange }) {
  return (
    <Navbar fluid>
      <Col xs={7} sm={6} md={5} lg={4}>
        <Navbar.Header>
          <LinkContainer to="/posts">
            <Navbar.Brand>Flora and Fauna Sighting</Navbar.Brand>
          </LinkContainer>
        </Navbar.Header>
      </Col>
      <Col xs={7} sm={6} md={5} lg={4}>
        <Navbar.Form>
          <Search />
        </Navbar.Form>
      </Col>
      <Nav pullRight>
        <PostAddNavItem user={user} onPostsChange={onPostsChange} />
        <SignInNavItem user={user} onUserChange={onUserChange} onPostsChange={onPostsChange} />

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
      signedIn givenName email
    }}`;
    const data = await graphQLFetch(query, null, null, cookie);
    return data;
  }

  constructor(props) {
    super(props);
    const user = store.userData ? store.userData.user : null;
    delete store.userData;

    this.onUserChange = this.onUserChange.bind(this);
    this.onPostsChange = this.onPostsChange.bind(this);

    this.state = {
      user,
      refresh: false,
      changeRefresh: this.onPostsChange,
    };
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


  onPostsChange(refresh) {
    this.setState({ refresh });
  }

  render() {
    const { user, refresh, changeRefresh } = this.state;
    const postContext = { refresh, changeRefresh };
    if (user == null) return null;
    return (
      <div>
        <NavBar user={user} onUserChange={this.onUserChange} onPostsChange={this.onPostsChange} />
        <Grid fluid>
          <UserContext.Provider value={user}>
            <PostContext.Provider value={postContext}>
              <Contents />
            </PostContext.Provider>
          </UserContext.Provider>
        </Grid>
      </div>
    );
  }
}
