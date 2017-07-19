import React from 'react';
import { Route, Switch } from 'react-router-dom';

import GreetingContainer from './greeting/greeting_container';
import AuthFormContainer from './auth_form/auth_form_container';

const App = () => (
  <Switch>
    <div className='auth-page'>
      <header>
        <h1 className='auth-header'>Picture Me Scrolling, PicMeS!</h1>
        <GreetingContainer />
        <Route path="/login" component={ AuthFormContainer } />
        <Route path="/signup" component={ AuthFormContainer }/>
      </header>
    </div>
  </Switch>
);

export default App;
