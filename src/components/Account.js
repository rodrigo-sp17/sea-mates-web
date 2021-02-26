import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Alert from './Alert';
import { AppBar, Divider, Grid, IconButton, List, ListItem, Toolbar, Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';

export default function Account(props) {
  const history = useHistory();

  const logout = () => {
  }

  return (
    <Grid container>
      <Grid item>
        <AppBar position="absolute">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={history.goBack}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">
              Minha Conta
            </Typography>
          </Toolbar>
        </AppBar>
      </Grid>
      <Grid item>
        <Grid item>
          <Typography variant="h5">
            {sessionStorage.getItem("loggedUser")}
          </Typography>
          <Typography variant="h6">
            Email
          </Typography>
        </Grid>
        <Divider />
        <Grid item>
          <List>
            <ListItem button onClick={logout}>
              Logout
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Grid>
  )
}