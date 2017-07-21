import { RECEIVE_ERRORS } from '../actions/session_actions';

import { CLEAR_ERRORS } from '../actions/errors_actions';

const defaultErrors = [];

const ErrorsReducer = (state = defaultErrors, action) => {
  console.log(action.type);
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
