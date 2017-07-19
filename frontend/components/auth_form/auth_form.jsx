import React from 'react';
import { Link, withRouter } from 'react-router-dom';


class AuthForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  update(property) {
    return e => this.setState({
      [property]: e.currentTarget.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log(this.state);
    const user = this.state;
    this.props.processForm(user);
  }

  navLink() {
    if (this.props.formType === 'login') {
      return <Link to ="/signup">Sign Up</Link>;
    } else {
      return <Link to="/login">Log In</Link>;
    }
  }

  authSubmitType() {
    this.props.formType === 'login' ? "Login" : "Sign Up";
  }

  render() {
    return (
      <div className="auth-form-container">
        <form className="auth-form-box" onSubmit={ this.handleSubmit }>
          <h1 className="auth-form-header">Get Your Scroll On</h1>
          <br />
          Please { this.props.formType } or { this.navLink() }
          <br />
          <label className="auth-username">
            Username:
            <input type="text"
                   value={this.state.username}
                   ref="username"
                   onChange={this.update('username')}
                   className="auth-login-input" />
          </label>
          <br />
          <label className="auth-password">
            Password:
            <input type="password"
                   value={this.state.password}
                   ref="password"
                   onChange={this.update('password')}
                   className="auth-login-input" />
          </label>
          <br />
          <input className="auth-submit" type="submit" value="Login" />
        </form>
      </div>
    );
  }
}

export default AuthForm;
