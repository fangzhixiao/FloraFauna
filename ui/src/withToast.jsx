import React from 'react';
import Toast from './Toast.jsx';

/**
 * Higher order component for adding Toast to a component. withToast is a function that takes in
 * a React Component and passes Toast methods and additional properties to the component.
 * @param OriginalComponent ReactComponent that will use Toast
 */

export default function withToast(OriginalComponent) {
  return class ToastWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        toastVisible: false,
        toastMessage: '',
        toastType: 'success',
      };
      this.showSuccess = this.showSuccess.bind(this);
      this.showError = this.showError.bind(this);
      this.dismissToast = this.dismissToast.bind(this);
    }

    showSuccess(message) {
      this.setState({
        toastVisible: true,
        toastMessage: message,
        toastType: 'success',
      });
    }

    showError(message) {
      this.setState({
        toastVisible: true,
        toastMessage: message,
        toastType: 'danger',
      });
    }

    dismissToast() {
      this.setState({ toastVisible: false });
    }

    render() {
      const { toastType, toastVisible, toastMessage } = this.state;

      return (
        <React.Fragment>
          <OriginalComponent
            showError={this.showError} // These methods all get passed to OriginalComponent + props
            showSuccess={this.showSuccess}
            dismissToast={this.dismissToast}
            {...this.props}
          />
          <Toast
            bsStyle={toastType}
            showing={toastVisible}
            onDismiss={this.dismissToast}
          >
            {toastMessage}
          </Toast>
        </React.Fragment>
      );
    }
  };
}
