import React from 'react';
import { Panel } from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
//
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import PostSightingFilter from './PostSightingFilter.jsx';
import withToast from './withToast.jsx';
import PostMap from './PostMap.jsx';

const TIME_INTERVALS = new Map();
TIME_INTERVALS.set('Early AM', { minHour: '00', maxHour: '06' });
TIME_INTERVALS.set('Morning', { minHour: '06', maxHour: '12' });
TIME_INTERVALS.set('Afternoon', { minHour: '12', maxHour: '18' });
TIME_INTERVALS.set('Evening', { minHour: '18', maxHour: '00' });

// eslint-disable-next-line react/prefer-stateless-function
class PostMapWrapper extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get('sightingType')) vars.sightingType = params.get('sightingType');
    if (params.get('date')) vars.spotted = params.get('date');

    if (params.get('time')) {
      const interval = TIME_INTERVALS.get(params.get('time'));
      vars.minHour = interval.minHour;
      vars.maxHour = interval.maxHour;
    }
    // TODO: Add hasImages based on images

    const query = `query postList(
      $sightingType: SightingType
      $spotted: GraphQLDate
      $minHour: GraphQLDate
      $maxHour: GraphQLDate
    ) {
      postList(
        sightingType: $sightingType
        spotted: $spotted
        minHour: $minHour
        maxHour: $maxHour
    ) {
      id
      title
      sightingType
      authorId
      created 
      spotted
      location {
        lat lng
        }
      imageUrls
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

  async loadData() {
    const { location: { search }, match, showError } = this.props;
    const data = await PostMapWrapper.fetchData(match, search, showError);
    if (data) {
      this.setState({
        posts: data.postList,
      });
    }
  }

  render() {
    const { posts } = this.state;
    if (posts == null) return null;

    console.log(posts);

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
        <div>
          <PostMap />
        </div>

      </React.Fragment>
    );
  }
}

const PostMapWithToast = withToast(PostMapWrapper);
PostMapWithToast.fetchData = PostMapWrapper.fetchData;
export default PostMapWithToast;
