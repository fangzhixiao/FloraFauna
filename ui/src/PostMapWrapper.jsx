import React from 'react';
import { Panel, Button } from 'react-bootstrap';
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

    if (params.get('time')) {
      const interval = TIME_INTERVALS.get(params.get('time'));
      vars.minTimeUTC = interval.minTimeUTC;
      vars.maxTimeUTC = interval.maxTimeUTC;
    }
    // TODO: Add hasImages based on images

    const query = `query postList(
      $sightingType: SightingType
      $dateUTC: String
      $minTimeUTC: String
      $maxTimeUTC: String
    ) {
      postList(
        sightingType: $sightingType
        dateUTC: $dateUTC
        minTimeUTC: $minTimeUTC
        maxTimeUTC: $maxTimeUTC
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
        commenter content createdUTC
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

    // this.onClick = this.onClick.bind(this);
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
      // // eslint-disable-next-line react/no-did-update-set-state
      // this.setState({ refresh: false });
    }
  }

  // onClick() {
  //   this.setState({ refresh: true });
  // }

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
        <div align="center">
          <Panel>
            <Panel.Heading>
              <Panel.Title toggle>Filter</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              <PostSightingFilter urlBase="/posts" />
            </Panel.Body>
          </Panel>
        </div>
        {/* <div> */}
        {/*  <Button onClick={this.onClick}>Refresh</Button> */}
        {/* </div> */}
        <div>
          <PostMap posts={posts} />
        </div>

      </React.Fragment>
    );
  }
}

PostMapWrapper.contextType = PostContext;
const PostMapWrapperWithToast = withToast(PostMapWrapper);
PostMapWrapperWithToast.fetchData = PostMapWrapper.fetchData;
export default PostMapWrapperWithToast;
