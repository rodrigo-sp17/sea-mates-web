import { CircularProgress, Container, makeStyles, Typography } from "@material-ui/core";
import UserClient from "clients/user_client";
import { userState } from "model/user_model";
import React, { useState } from "react";
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { useSetRecoilState } from "recoil";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    alignItems: 'center',
    verticalAlign: 'center'
  },
}));

// Used to load authentication details from URL into session
export default function LoginSuccess() {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const setUser = useSetRecoilState(userState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      redirectHome();
    } else {
      getUserInfo();
    }
  }, [isLoading]);

  const getUserInfo = async () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    var fetchedUser = await UserClient.fetchUserInfo('Bearer ' + token);
    setUser(fetchedUser);
    setIsLoading(true);
  }    

  const redirectHome = () => history.push("/");
  
  return (
    <Container className={classes.paper}>
      {isLoading ? <CircularProgress /> : <Typography children={'Successful!'}/>}
    </Container>
  );
}