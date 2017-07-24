import * as APIUtil from '../util/session_api_util';
import * as Errors from './errors_actions';

export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';

export const receiveCurrentUser = currentUser => ({
  type: RECEIVE_CURRENT_USER,
  currentUser
});

export const signup = user => dispatch => (
    APIUtil.signup(user).then(newUser => {
        dispatch(receiveCurrentUser(newUser));
        dispatch(Errors.clearErrors());
    }, errors => (
        dispatch(Errors.receiveErrors(errors.responseJSON))
    )
  )
);

export const login = user => dispatch => {
  return(
    APIUtil.login(user).then(previousUser => {
      dispatch(receiveCurrentUser(previousUser));
      dispatch(Errors.clearErrors());
    }, errors => (
        dispatch(Errors.receiveErrors(errors.responseJSON))
      )
    )
  );
};

export const logout = () => dispatch => (
  APIUtil.logout().then(user => (
      dispatch(receiveCurrentUser(null))
    )
  )
);
