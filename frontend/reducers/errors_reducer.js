// import { RECEIVE_ERRORS } from '../actions/session_actions';

import { RECEIVE_ERRORS,
         CLEAR_ERRORS } from '../actions/errors_actions';

const defaultErrors = [];

const ErrorsReducer = (state = defaultErrors, action = CLEAR_ERRORS) => {
  switch (action.type) {
    case RECEIVE_ERRORS:
      return action.errors;
    case CLEAR_ERRORS:
      return [];
    default:
      return state;
  }
};

export default ErrorsReducer;
