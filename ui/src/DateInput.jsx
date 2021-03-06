import React from 'react';
import { Col } from 'react-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';

function isValidDate(date) {
  const current = new Date(new Date().getTime());
  return date < moment(current);
}

export default class DateInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    let dateString;
    try {
      dateString = e.format('MMMM DD, YYYY hh:mm:ss a');
      if (dateString) {
        this.setState({ value: dateString });
        const { onChange } = this.props;
        onChange(e);
      }
    } catch (error) {
      dateString = null;
    }
  }

  render() {
    const { value } = this.state;
    const { align } = this.props;
    const { ...props } = this.props;

    let displayValue = new Date(value);
    let formattedDate = moment(displayValue).format('MMMM DD, YYYY, hh:mm a');

    if (displayValue.toString() === 'Invalid Date') {
      displayValue = '';
      formattedDate = '';
    }

    return (
      <div>
        {formattedDate}
        <div align={align}>

            <Datetime
              {...props}
              value={displayValue}
              onChange={this.onChange}
              isValidDate={isValidDate}
            />

        </div>
      </div>
    );
  }
}
