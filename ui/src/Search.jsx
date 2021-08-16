import React from 'react';
import URLSearchParams from 'url-search-params';
import { withRouter } from 'react-router-dom';
import {
  Navbar, FormGroup, FormControl, Button,
} from 'react-bootstrap';

class Search extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      search: params.get('search') || '',
    };

    this.applySearch = this.applySearch.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
  }


  onChangeSearch(e) {
    this.setState({ search: e.target.value });
  }

  applySearch() {
    const { search: searchTerms } = this.state;
    const { history } = this.props;
    const params = new URLSearchParams();
    if (searchTerms) params.set('search', searchTerms);
    const search = params.toString() ? `?${params.toString()}` : '';
    history.push(`/posts/${search}`);
  }

  render() {
    return (
      <Navbar.Form>
        <FormGroup>
          <FormControl type="text" placeholder="Search" onChange={this.onChangeSearch} />
        </FormGroup>
        {' '}
        <Button type="submit" onClick={this.applySearch}>Submit</Button>
      </Navbar.Form>
    );
  }
}

export default withRouter(Search);
