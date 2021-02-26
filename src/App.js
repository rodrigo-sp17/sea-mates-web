import React from 'react';
import Home from './Home.js';
import Login from './auth/Login.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import Signup from './auth/Signup.js';
import Shift from './shifts/Shift.js';
import Recovery from './auth/Recovery.js';
import PasswordReset from './auth/PasswordReset.js';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    common: {
      black:"#000",
      white:"#fff"
    },
    background: {
      paper: "rgba(235, 246, 249, 1)",
      default: "#fafafa"
    },
    primary: {
      light: "#7986cb",
      main: "rgba(2, 27, 154, 1)",
      dark:"#303f9f",
      contrastText:"#fff"
    },
    secondary: {
      light: "#ff4081",
      main: "rgba(182, 128, 2, 1)",
      dark: "#c51162",
      contrastText: "#fff"
    },
    error: {
      light: "#e57373",
      main:"#f44336",
      dark: "#d32f2f",
      contrastText:"#fff"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint:"rgba(0, 0, 0, 0.38)"
    }
  },
  typography: {
    button: {
      fontSize: "1rem",
      fontWeight: "500",
      letterSpacing: "0.02857em"
    }
  }
})


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
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
      </ThemeProvider>
    </React.Fragment>
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
