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

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggedIn) {
      this.props.history.push("/dashboard");
    }
  }

  update(property) {
    return e => this.setState({
      [property]: e.currentTarget.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const user = this.state;
    this.props.processForm(user);
  }

  logInAsGuest(e){
    e.preventDefault();
    let username = 'Demo PicMeS';
    let password = 'pass123';

   for (let i = 0; i < username.length; i++) {
      setTimeout(() => this.setState({username: username.slice(0, i + 1)}), (i * 75));
    }
    for (let i = 0; i < password.length; i++) {
      setTimeout(() => this.setState({password: password.slice(0, i + 1)}), ((i + username.length) * 75));
    }
    const user = {username: 'GuestUser', password: 'password123'};
    setTimeout(() => this.props.login({user}), (1700));
  }

  navLink() {
    if (this.props.formAction === 'signup') {
      return <Link to="/">Log In</Link>;
    } else {
      return <Link to ="/signup">Sign Up</Link>;
    }
  }

  authSubmitType() {
    return (
      (this.props.formAction === 'signup') ? "Sign Up" : "Log In"
    );
  }


  renderErrors() {
    return(
      <ul>
        { this.props.errors.map((error, index) => (
          <li key={`error-${index}`}>
            { error }
          </li>
        ))
      }
      </ul>
    );
  }

  render() {
    return (
      <div className='auth-page'>
        <navbar className="auth-navbar">
          <h1 className='auth-header'>
            PicMeS
          </h1>
          <header className="login-signup">
            { this.navLink() }
          </header>
        </navbar>
        <div className="auth-body">
          <section className="auth-body-title">
            <h1 className="auth-title-top">Picture</h1>
            <h1 className="auth-title-mid">Me</h1>
            <h1 className="auth-title-btm">Scrolling</h1>
          </section>
          <section className="auth-form-box">
            <h1 className="auth-form-header">
              Let's Begin
            </h1>
            <br />
            <br />
            <label className="auth-username">
              <input type="text"
                value={this.state.username}
                ref="username"
                placeholder="Your Username"
                onChange={this.update('username')}
                className="auth-login-input" />
            </label>
            <br />
            <label className="auth-password">
              <input type="password"
                value={this.state.password}
                ref="password"
                placeholder="Your Password"
                onChange={this.update('password')}
                className="auth-login-input" />
            </label>
            <br />
            <Link to="/dashboard" className="auth-submit"
              onClick={ this.handleSubmit }>
              { this.authSubmitType() }
            </Link>
            <Link to="/dashboard" className="guest-login" onClick={ this.logInAsGuest }>
              Guest Log In
            </Link>
            <br />
          </section>
        </div>
        <footer className="auth-footer">
          <a href="https://github.com/ade713" target="_blank">
            <i className="fa fa-github fa-2x" aria-hidden="true"></i>
          </a>
          <a href="https://www.linkedin.com/in/ade-farquhar-2a66a233" target="_blank">
            <i className="fa fa-linkedin-square fa-2x" aria-hidden="true"></i>
          </a>
        </footer>
      </div>
    );
  }
}

export default AuthForm;
