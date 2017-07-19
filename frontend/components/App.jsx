import React from 'react';
import { HashRouter,
         Route,
         Switch } from 'react-router-dom';

import GreetingContainer from './greeting/greeting_container';
import AuthFormContainer from './auth_form/auth_form_container';

const App = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/login" component={ AuthFormContainer } />
      <Route exact path="/signup" component={ AuthFormContainer }/>
      <Route exact path="/" component={ GreetingContainer } />
    </Switch>
  </HashRouter>
);

export default App;
