import React from 'react';
import { Panel, Col } from 'react-bootstrap';
// import URLSearchParams from 'url-search-params';
//
// import IssueFilter from './IssueFilter.jsx';
// import IssueDetail from './IssueDetail.jsx';
// import graphQLFetch from './graphQLFetch.js';
// import store from './store.js';
import PostSightingFilter from './PostSightingFilter.jsx';
import withToast from './withToast.jsx';


// eslint-disable-next-line react/prefer-stateless-function
class PostMap extends React.Component {
  // static async fetchData(match, search, showError) { TODO: This will be important for filter uses
  //   // const params = new URLSearchParams(search);
  //   // const vars = { hasSelection: false, selectedId: 0 };
  //   // if (params.get('status')) vars.status = params.get('status');
  //   //
  //   // const effortMin = parseInt(params.get('effortMin'), 10);
  //   // if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
  //   // const effortMax = parseInt(params.get('effortMax'), 10);
  //   // if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;
  //   //
  //   // const { params: { id } } = match;
  //   // const idInt = parseInt(id, 10);
  //   // if (!Number.isNaN(idInt)) {
  //   //   vars.hasSelection = true;
  //   //   vars.selectedId = idInt;
  //   // }
  //   //
  //   // const query = `placeholder`;
  //   //
  //   // const data = await graphQLFetch(query, vars, showError);
  //   // return data;
  // }

  // constructor() {
  //   super();
  //   const initialData = store.initialData || { issueList: {} };
  //   const {
  //     issueList: { issues, pages }, issue: selectedIssue,
  //   } = initialData;
  //
  //   delete store.initialData;
  //   this.state = {
  //     sightings
  //   };
  //   this.closeIssue = this.closeIssue.bind(this);
  //   this.deleteIssue = this.deleteIssue.bind(this);
  // }

  // componentDidMount() {
  //   const { sightings } = this.state;
  //   if (sightings == null) this.loadData();
  // }
  //
  // componentDidUpdate(prevProps) {
  //   const {
  //     location: { search: prevSearch },
  //     match: { params: { id: prevId } },
  //   } = prevProps;
  //   const { location: { search }, match: { params: { id } } } = this.props;
  //   if (prevSearch !== search || prevId !== id) {
  //     this.loadData();
  //   }
  // }

  // async loadData() { TODO: will have to load marker data and map here;
  //   const { location: { search }, match, showError } = this.props;
  //   const data = await PostMap.fetchData(match, search, showError);
  //   if (data) {
  //     this.setState({
  //       issues: data.issueList.issues,
  //       selectedIssue: data.issue,
  //       pages: data.issueList.pages,
  //     });
  //   }
  // }

  render() {
    // const { sightings } = this.state;
    // if (sightings == null) return null;
    // const { location: { search } } = this.props;
    //
    // const params = new URLSearchParams(search);
    //
    // const items = [];

    return (
      <React.Fragment>
        <Col xs="7" sm="6" md="5" lg="4">
          <Panel>
            <Panel.Heading>
              <Panel.Title>Filter</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <PostSightingFilter urlBase="/map" />
            </Panel.Body>
          </Panel>
        </Col>
        <Col>
          <h1> THIS IS A PLACEHOLDER FOR A MAP </h1>
        </Col>

      </React.Fragment>
    );
  }
}

const PostMapWithToast = withToast(PostMap);
// PostMapWithToast.fetchData = PostMap.fetchData;
export default PostMapWithToast;
