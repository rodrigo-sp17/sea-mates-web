import React from 'react';
import Home from 'Home';
import Login from 'auth/Login';
import SocialSignup from 'auth/SocialSignup';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Signup from 'auth/Signup';
import ShiftDialog from 'shifts/ShiftDialog';
import Recovery from 'auth/Recovery';
import PasswordReset from 'auth/PasswordReset';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import LoginSuccess from 'auth/LoginSuccess';
import Privacy from 'misc/Privacy';
import ServiceTerms from 'misc/ServiceTerms';
import { userState } from 'model/user_model';
import { useRecoilValue } from 'recoil';

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
      light: "#456da2",
      main: "#064273",
      dark:"#001c47",
      contrastText:"#ffffff"
    },
    secondary: {
      light: "#a8e8f7",
      main: "#76b6c4",
      dark: "#458694",
      contrastText: "#ffffff"
    },
    error: {
      light: "#e57373",
      main:"#f44336",
      dark: "#d32f2f",
      contrastText:"#fff"
    },
    text: {
      primary: "#000000",
      secondary: "#000000",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint:"rgba(0, 0, 0, 0.38)"
    }
  },
  typography: {
    button: {
      fontSize: "1rem",
      fontWeight: 500,
      letterSpacing: "0.02857em"
    }
  }
})


function PrivateRoute({ children, ...rest }: any) {
  const user = useRecoilValue(userState);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        user ? (
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
            <PrivateRoute exact path="/">
              <Redirect to="/home" />
            </PrivateRoute> 
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/privacy">
              <Privacy />
            </Route>
            <Route exact path="/terms">
              <ServiceTerms />
            </Route>
            <Route exact path="/signup">
              <Signup />
            </Route>
            <PrivateRoute path="/home">
              <Home />
            </PrivateRoute>        
            <PrivateRoute exact path="/shift">
              <ShiftDialog />
            </PrivateRoute>
            <Route exact path="/recovery">
              <Recovery />
            </Route>
            <Route exact path="/changePassword"><PasswordReset /></Route>
            <Route exact path="/loginSuccess"><LoginSuccess/></Route>
            <Route exact path="/socialSignup"><SocialSignup/></Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
}
