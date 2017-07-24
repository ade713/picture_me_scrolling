import { RECEIVE_ERRORS,
         CLEAR_ERRORS } from '../actions/errors_actions';

const defaultErrors = [];

const ErrorsReducer = (state = defaultErrors, action) => {
  switch (action.type) {
    case RECEIVE_ERRORS:
      console.log(action);
      return action.errors;
    case CLEAR_ERRORS:
      return [];
    default:
      return state;
  }
};

export default ErrorsReducer;
