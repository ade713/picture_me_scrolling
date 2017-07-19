import React from 'react';
import { Link, withRouter } from 'react-router-dom';


class AuthForm extends React.Component {
  constructor(props) {
    console.log(props);
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loggedIn) {
      this.props.history.push("/");
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
      <div className='auth-page'>
        <header className="">
          <h1 className='auth-header'>Picture Me Scrolling, PicMeS!</h1>
        </header>
        <section className="auth-form-container">

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

          <Link to="/dashboard"
                className="auth-submit"
                onClick={ this.handleSubmit }>
                Log In
          </Link>
        </section>
      </div>
    );
  }
}

export default AuthForm;
