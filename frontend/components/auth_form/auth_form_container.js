import { connect } from 'react-redux';

import { login, logout, signup } from '../../actions/session_actions';
import AuthForm from './auth_form';


const mapStateToProps = ({ session }) => {
  return {
    loggedIn: Boolean(session.currentUser),
    errors: session.errors
  };
};

const mapDispatchToProps = (dispatch, { location }) => {
  const formAction = location.pathname.slice(1);
  const formType = (formAction === 'signup') ? signup : login;
  const processForm = formType;
  return {
    processForm: user => dispatch(processForm(user)),
    formType,
    formAction
  };
};

const AuthFormContainer = connect(
  mapStateToProps, mapDispatchToProps
)(AuthForm);

export default AuthFormContainer;
