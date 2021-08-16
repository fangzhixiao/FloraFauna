import React from 'react';
import { Panel, Col } from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
//
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import PostSightingFilter from './PostSightingFilter.jsx';
import withToast from './withToast.jsx';
import PostMap from './PostMap.jsx';
import PostContext from './PostContext.js';

const TIME_INTERVALS = new Map();
TIME_INTERVALS.set('Early AM', { minTimeUTC: '00:00:00', maxTimeUTC: '05:59:59' });
TIME_INTERVALS.set('Morning', { minTimeUTC: '06:00:00', maxTimeUTC: '11:59:59' });
TIME_INTERVALS.set('Afternoon', { minTimeUTC: '12:00:00', maxTimeUTC: '17:59:59' });
TIME_INTERVALS.set('Evening', { minTimeUTC: '18:00:00', maxTimeUTC: '23:59:59' });

// eslint-disable-next-line react/prefer-stateless-function
class PostMapWrapper extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get('sightingType')) vars.sightingType = params.get('sightingType');
    if (params.get('date')) {
      const date = new Date(params.get('date'));
      if (date !== 'Invalid Date') {
        vars.dateUTC = date.toISOString(); // backend reads ISO strings
      }
    }

    if (params.get('search')) vars.search = params.get('search');

    if (params.get('time')) {
      const interval = TIME_INTERVALS.get(params.get('time'));
      vars.minTimeUTC = interval.minTimeUTC;
      vars.maxTimeUTC = interval.maxTimeUTC;
    }
    // TODO: Add hasImages based on images

    const query = `query postList(
      $sightingType: SightingType
      $search: String
      $dateUTC: String
      $minTimeUTC: String
      $maxTimeUTC: String
    ) {
      postList(
        sightingType: $sightingType
        dateUTC: $dateUTC
        minTimeUTC: $minTimeUTC
        maxTimeUTC: $maxTimeUTC
        search: $search
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
        commenterId content createdUTC
      }
    }
  }`;

    const data = await graphQLFetch(query, vars, showError);
    return data;
  }

  constructor(props) {
    super(props);
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
    const { refresh, changeRefresh } = this.context;
    if (refresh === true) {
      this.loadData();
      changeRefresh(false);
    }
  }

  async loadData() {
    const { location: { search }, match, showError } = this.props;
    const data = await PostMapWrapper.fetchData(match, search, showError);
    if (data) {
      this.setState({
        posts: data,
      });
    }
  }

  render() {
    const { posts } = this.state;
    if (posts == null) return null;

    return (
      <React.Fragment>
        <Col xs={6} sm={5} md={4} lg={3}>
          <div align="center">
            <Panel>
              <Panel.Body>
                Right click on the map to add a new post.
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Heading>
                <Panel.Title>Filter</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <PostSightingFilter urlBase="/posts" />
              </Panel.Body>
            </Panel>
          </div>
        </Col>
        <Col xs={6} sm={5} md={4} lg={3}>
          <div>
            <PostMap posts={posts} />
          </div>

        </Col>

      </React.Fragment>
    );
  }
}

PostMapWrapper.contextType = PostContext;
const PostMapWrapperWithToast = withToast(PostMapWrapper);
PostMapWrapperWithToast.fetchData = PostMapWrapper.fetchData;
export default PostMapWrapperWithToast;
