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
  Panel, Tooltip, OverlayTrigger,
} from 'react-bootstrap';

class PostSightingFilter extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      sightingType: params.get('sightingType') || '',
      date: params.get('date') || '',
      time: params.get('time') || '',
      hasImage: params.get('image') || '',
    };
    this.onChangeSightingType = this.onChangeSightingType.bind(this);
    this.onClickDateClear = this.onClickDateClear.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onChangeTime = this.onChangeTime.bind(this);
    this.onChangeHasImage = this.onChangeHasImage.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.clearFilter = this.clearFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.showOriginalFilter();
    }
  }

  onChangeSightingType(e) {
    this.setState({ sightingType: e.target.value });
  }

  onChangeDate(e) {
    let dateString;
    try {
      dateString = e.format('MMMM DD, YYYY');
      if (dateString) {
        this.setState({ date: dateString });
      }
    } catch (error) {
      dateString = null;
    }
  }

  onClickDateClear() {
    this.setState({ date: '' });
  }

  onChangeTime(e) {
    this.setState({ time: e.target.value });
  }

  onChangeHasImage(e) {
    this.setState({ hasImage: e.target.value });
  }

  clearFilter() {
    this.setState({
      sightingType: '',
      date: '',
      time: '',
      hasImage: '',
    });
  }

  applyFilter() {
    const {
      sightingType, date, time, hasImage,
    } = this.state;
    const { history, urlBase } = this.props;
    const params = new URLSearchParams();
    if (sightingType) params.set('sightingType', sightingType);
    if (date) params.set('date', date);
    if (time) params.set('time', time);
    if (hasImage) params.set('image', hasImage);
    const search = params.toString() ? `?${params.toString()}` : '';
    history.push({ pathname: urlBase, search });
  }

  render() {
    const {
      sightingType, date, time, hasImage,
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
            <div align="left">
              <ControlLabel>
                Date:
                {' '}
                {date}
              </ControlLabel>
            </div>
            <Datetime
              value={dateView}
              timeFormat={false}
              input={false}
              onChange={this.onChangeDate}
            />
            <div align="right">
              <OverlayTrigger
                placement="right"
                delayShow={1000}
                overlay={<Tooltip id="details">clear date selection</Tooltip>}
              >
                <Button bsStyle="primary" bsSize="xsmall" onClick={this.onClickDateClear}>clear</Button>
              </OverlayTrigger>
            </div>
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Sighting Time</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ControlLabel>Sighting Time</ControlLabel>
            <InputGroup>
              <FormControl
                componentClass="select"
                value={time}
                onChange={this.onChangeTime}
              >
                <option value="">(All)</option>
                <option value="Early AM">Early AM: 12AM - 6AM</option>
                <option value="Morning">Morning: 6AM - 12PM</option>
                <option value="Afternoon">Afternoon: 12PM - 6PM</option>
                <option value="Evening">Evening: 6PM - 12AM</option>
              </FormControl>
            </InputGroup>
          </Panel.Body>
        </Panel>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Images</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <ControlLabel>Images</ControlLabel>
            <FormControl
              componentClass="select"
              value={hasImage}
              onChange={this.onChangeHasImage}
            >
              <option value="">(All)</option>
              <option value="true">Post has images</option>
              <option value="false">Post does not have images</option>
            </FormControl>
          </Panel.Body>
        </Panel>
        <FormGroup>
          <ControlLabel>&nbsp;</ControlLabel>
          <ButtonToolbar>
            <Button bsStyle="primary" type="button" onClick={this.applyFilter}>
              Apply
            </Button>
            <OverlayTrigger
              placement="right"
              delayShow={1000}
              overlay={<Tooltip id="details">Clear filter selections</Tooltip>}
            >
              <Button
                type="button"
                onClick={this.clearFilter}
              >
                Reset
              </Button>
            </OverlayTrigger>

          </ButtonToolbar>
        </FormGroup>
      </Col>
    );
  }
}

export default withRouter(PostSightingFilter);
