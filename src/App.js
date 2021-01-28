//import logo from './logo.svg';
//import './App.css';
import React, { useState } from 'react';
import Home from './Home.js';
import Login from './Login.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Signup from './Signup.js';
import Shift from './Shift.js';


function PrivateRoute({ children, ...rest }) {
  let auth = sessionStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function App() {

  return (
    <Router>
      <Switch>        
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/shift">
          <Shift />
        </Route>     
      </Switch>
    </Router>
  );

  /* <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div> */
}

export default App;
