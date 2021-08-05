import React from 'react';
import { Panel, Col } from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
//
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import PostSightingFilter from './PostSightingFilter.jsx';
import withToast from './withToast.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class PostMap extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get('sightingType')) vars.sightingType = params.get('sightingType');
    if (params.get('date')) vars.date = params.get('date');
    // if (params.get('time')) vars.time = params.get('time');

    // const { params: { id } } = match;
    // const idInt = parseInt(id, 10);
    // if (!Number.isNaN(idInt)) {
    //   vars.hasSelection = true;
    //   vars.selectedId = idInt;
    // }

    // TODO: figure out how to use graphQL date to filter by time (without consideration for time)

    const query = `query postList(
      $sightingType: SightingType
      $spotted: GraphQLDate
      $minTime: GraphQLDate
      $maxTime: GraphQLDate
    ) {
      postList(
        sightingType: $sightingType
        spotted: $spotted
        minTime: $minTime
        maxTime: $maxTime
    ) {
      id
      title
      sightingType
      authorId
      created 
      spotted
      location {
        lat lon
        }
      images
      description 
      comments {
        commenter content created
      }
    }
  }`;

    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor() {
    super();
    const posts = store.initialData || { postList: [] };
    delete store.initialData;

    this.state = {
      posts,
    };
  }

  componentDidMount() {
    const { posts } = this.state;
    if (posts == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
      match: { params: { id: prevId } },
    } = prevProps;
    const { location: { search }, match: { params: { id } } } = this.props;
    if (prevSearch !== search || prevId !== id) {
      this.loadData();
    }
  }

  // TODO: currently loads a list, will need to load marker data when map is active
  async loadData() {
    const { location: { search }, match, showError } = this.props;
    const data = await PostMap.fetchData(match, search, showError);
    if (data) {
      this.setState({
        posts: data.postList,
      });
    }
  }

  render() {
    const { posts } = this.state;
    if (posts == null) return null;
    // eslint-disable-next-line no-console
    console.log(posts);

    return (
      <React.Fragment>
        <Col xs={7} sm={6} md={5} lg={4}>
          <Panel>
            <Panel.Heading>
              <Panel.Title>Filter</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <PostSightingFilter urlBase="/posts" />
            </Panel.Body>
          </Panel>
        </Col>
        <Col>
          <h2> THIS IS A PLACEHOLDER FOR A MAP </h2>
        </Col>

      </React.Fragment>
    );
  }
}

const PostMapWithToast = withToast(PostMap);
PostMapWithToast.fetchData = PostMap.fetchData;
export default PostMapWithToast;
