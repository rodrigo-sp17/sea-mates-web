import React, { ReactNode, useEffect } from 'react';
import Home from 'view/Home';
import Login from 'view/auth/Login';
import SocialSignup from 'view/auth/SocialSignup';
import {
  Switch,
  Route,
  Redirect,
  useHistory,
} from "react-router-dom";
import Signup from 'view/auth/Signup';
import ShiftDialog from 'view/shifts/ShiftDialog';
import Recovery from 'view/auth/Recovery';
import PasswordReset from 'view/auth/PasswordReset';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import LoginSuccess from 'view/auth/LoginSuccess';
import Privacy from 'view/legal/Privacy';
import ServiceTerms from 'view/legal/ServiceTerms';
import { accessDeniedState, userLoadedState, useUserModel } from 'api/model/user_model';
import { useRecoilState, useRecoilValue } from 'recoil';
import ForbiddenError from 'api/errors/forbidden_error';
import CenterLoadingScreen from 'view/components/CenterLoadingScreen';

const theme = createMuiTheme({
  palette: {
    common: {
      black: "#000",
      white: "#fff"
    },
    background: {
      paper: "rgba(235, 246, 249, 1)",
      default: "#fafafa"
    },
    primary: {
      light: "#456da2",
      main: "#064273",
      dark: "#001c47",
      contrastText: "#ffffff"
    },
    secondary: {
      light: "#a8e8f7",
      main: "#76b6c4",
      dark: "#458694",
      contrastText: "#ffffff"
    },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#fff"
    },
    text: {
      primary: "#000000",
      secondary: "#000000",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)"
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
  const loaded = useRecoilValue(userLoadedState);
  const { loadAuthUser, isAuthenticated } = useUserModel();

  useEffect(() => {
    if (!loaded) {
      loadAuthUser();
    }
  }, [loaded]);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        loaded
          ? isAuthenticated() ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
          : <CenterLoadingScreen />
      }
    />
  );
}

interface Props {
  forbiddenCallback: () => void,
  children: ReactNode
}

interface State {
  error: Error | null
  hasError: boolean;
}


class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    error: new Error(),
    hasError: false
  }

  static getDerivedStateFromError(error: Error) {
    return { error: error, hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      if (err instanceof ForbiddenError) {
        this.props.forbiddenCallback();
      } 
    }
    return this.props.children;
  }

}

export default function App() {
  const history = useHistory();
  const [isAccessDenied, setAccessDenied] = useRecoilState(accessDeniedState);
  const { logout } = useUserModel();

  // Will trigger a login redirect each time an 403 status is received by a fetch
  useEffect(() => {
    if (isAccessDenied) {
      logout();
      setAccessDenied(false);
    }
  }, [isAccessDenied]);

  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary forbiddenCallback={() => setAccessDenied(true)} >
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
            <Route exact path="/loginSuccess"><LoginSuccess /></Route>
            <Route exact path="/socialSignup"><SocialSignup /></Route>
          </Switch>
        </ErrorBoundary>
      </ThemeProvider>
    </React.Fragment>
  );
}
