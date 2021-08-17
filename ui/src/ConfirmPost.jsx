import React from 'react';
import {
  Glyphicon, Button, Badge,
} from 'react-bootstrap';
import UserContext from './UserContext.js';
import graphQLFetch from './graphQLFetch.js';

class ConfirmPost extends React.Component {
  constructor(props) {
    super(props);

    const { confirmed } = this.props;
    this.state = {
      liked: false,
      count: confirmed,
    };

    this.onClick = this.onClick.bind(this);
  }

  async onClick(e) {
    e.preventDefault();
    const { id, showError, changeRefresh } = this.props;
    const { liked } = this.state;
    if (liked === true) {
      const query = `mutation postDecrementConfirmed($id: String!) {
       postDecrementConfirmed(id: $id)
     }`;
      const data = await graphQLFetch(
        query, { id }, showError,
      );
      if (data) {
        changeRefresh(true);
        this.setState({ liked: false });
        this.setState({ count: data.postDecrementConfirmed });
      }
    } else {
      const query = `mutation postIncrementConfirmed($id: String!) {
       postIncrementConfirmed(id: $id)
     }`;
      const data = await graphQLFetch(
        query, { id }, showError,
      );
      if (data) {
        changeRefresh(true);
        this.setState({ liked: true });
        this.setState({ count: data.postIncrementConfirmed });
      }
    }
  }

  render() {
    const { authorId, user } = this.props;
    const { liked, count } = this.state;

    const disable = user.id === authorId || !user.signedIn;

    const ShowOK = () => {
      if (liked === true) {
        return (
          <Glyphicon glyph="ok" />
        );
      }
      return null;
    };

    return (
      <div>
        <Button disabled={disable} onClick={this.onClick}>
          Like
          {' '}
          <ShowOK />
        </Button>
        <Badge>{count}</Badge>

      </div>
    );
  }
}

export default ConfirmPost;
