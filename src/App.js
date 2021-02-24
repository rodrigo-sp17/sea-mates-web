//import logo from './logo.svg';
//import './App.css';
import React from 'react';
import Home from './Home.js';
import Login from './Login.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Signup from './Signup.js';
import Shift from './Shift.js';
import Recovery from './Recovery.js';
import PasswordReset from './PasswordReset.js';


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


export default function App() {

  // Main routing for the application
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route> 
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/signup">
          <Signup />
        </Route>
        <Route path="/home">
          <Home />
        </Route>        
        <Route exact path="/shift">
          <Shift />
        </Route>
        <Route exact path="/recovery">
          <Recovery />
        </Route>
        <Route exact path="/changePassword"><PasswordReset /></Route>
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
