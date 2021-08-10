import React from 'react';
import URLSearchParams from 'url-search-params';
import { withRouter } from 'react-router-dom';
import Datetime from 'react-datetime';

import {
  ButtonToolbar,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
  Col,
  Panel,
} from 'react-bootstrap';

class PostSightingFilter extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      sightingType: params.get('sightingType') || '',
      date: params.get('date') || '',
      time: params.get('time') || '',
      changed: false,
    };
    this.onChangeSightingType = this.onChangeSightingType.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onChangeTime = this.onChangeTime.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOriginalFilter = this.showOriginalFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.showOriginalFilter();
    }
  }

  onChangeSightingType(e) {
    this.setState({ sightingType: e.target.value, changed: true });
  }

  onChangeDate(e) {
    let dateString;
    try {
      dateString = e.format('MMMM DD, YYYY');
      if (dateString) {
        this.setState({ date: dateString, changed: true });
      }
    } catch (error) {
      dateString = null;
    }
  }

  onChangeTime(e) {
    let timeString;
    try {
      timeString = e.format('hh:mm:ss a');
      if (timeString) {
        this.setState({ time: timeString, changed: true });
      }
    } catch (error) {
      timeString = null;
    }
  }

  showOriginalFilter() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    this.setState({
      sightingType: params.get('sightingType') || '',
      date: params.get('date') || '',
      time: params.get('time') || '',
      changed: false,
    });
  }

  applyFilter() {
    const { sightingType, date, time } = this.state;
    const { history, urlBase } = this.props;
    const params = new URLSearchParams();
    if (sightingType) params.set('sightingType', sightingType);
    if (date) params.set('date', date);
    if (time) params.set('time', time); // right now shows by hour -- possibly show sightings by hr
    const search = params.toString() ? `?${params.toString()}` : '';
    history.push({ pathname: urlBase, search });
  }

  render() {
    const {
      sightingType, date, time, changed,
    } = this.state;

    let dateView = new Date(date);
    if (dateView.toString() === 'Invalid Date') {
      dateView = '';
    }

    return (
      <Col>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Sighting Type</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ControlLabel>Sighting Type</ControlLabel>
            <FormControl
              componentClass="select"
              value={sightingType}
              onChange={this.onChangeSightingType}
            >
              <option value="">(All)</option>
              <option value="ANIMAL">Animal</option>
              <option value="PLANT">Plant</option>
            </FormControl>
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Sighting Date</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ControlLabel>
              Sighting Date:
              {' '}
              {date}
            </ControlLabel>
            <Datetime
              value={dateView}
              timeFormat={false}
              input={false}
              onChange={this.onChangeDate}
            />
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Sighting Time</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ControlLabel>Sighting Time</ControlLabel>
            <InputGroup>
              <Datetime
                value={time}
                dateFormat={false}
                input={false}
                timeFormat="h a"
                onChange={this.onChangeTime}
              />
            </InputGroup>
          </Panel.Body>
        </Panel>
        <FormGroup>
          <ControlLabel>&nbsp;</ControlLabel>
          <ButtonToolbar>
            <Button bsStyle="primary" type="button" onClick={this.applyFilter}>
              Apply
            </Button>
            <Button
              type="button"
              onClick={this.showOriginalFilter}
              disabled={!changed}
            >
              Reset
            </Button>
          </ButtonToolbar>
        </FormGroup>
      </Col>
    );
  }
}

export default withRouter(PostSightingFilter);
