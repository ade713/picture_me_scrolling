import React from 'react';
import GreetingContainer from './greeting/greeting_container';

const App = () => (
  <div className='auth-page'>
    <header>
      <h1 className='auth-header'>Picture Me Scrolling, PicMeS!</h1>
      <GreetingContainer />
    </header>
  </div>
);

export default App;
