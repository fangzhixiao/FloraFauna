import React from 'react';
import {Button, Panel, Row} from 'react-bootstrap';
import URLSearchParams from 'url-search-params';
//
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import PostSightingFilter from './PostSightingFilter.jsx';
import withToast from './withToast.jsx';
import PostMap from './PostMap.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class PostMapWrapper extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get('sightingType')) vars.sightingType = params.get('sightingType');
    if (params.get('date')) vars.date = params.get('date');
    // TODO: Add hasImages based on images
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
    console.log(data);
    return data;
  }

  constructor(props) {
    super(props);
    const posts = store.initialData || { postList: [] };

    delete store.initialData;
    this.state = {
      posts,
      refresh : false,
    };

    this.onClick = this.onClick.bind(this);

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

    const {refresh} = this.state;

    if (refresh === true) {
      this.loadData();
      this.setState({refresh: false});
    }

  }

  onClick(e){
    this.setState({refresh:true});
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

    return (
      <React.Fragment>
        <Row xs={7} sm={6} md={5} lg={4}>
          <Panel>
            <Panel.Heading>
              <Panel.Title toggle>Filter</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              <PostSightingFilter urlBase="/posts" />
            </Panel.Body>
          </Panel>
        </Row>

        <Row>
          <Button onClick={this.onClick}>
            refresh
          </Button>
        </Row>

        <Row>
          <PostMap posts = {posts} />
        </Row>

      </React.Fragment>
    );
  }
}

const PostMapWithToast = withToast(PostMapWrapper);
PostMapWithToast.fetchData = PostMapWrapper.fetchData;
export default PostMapWithToast;
