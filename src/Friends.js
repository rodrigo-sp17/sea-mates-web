import {React, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {useHistory} from 'react-router-dom';
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, Fab, Grid, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import { Add, RemoveCircleOutline} from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,    
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Friends(props) {
  const classes = useStyles();
  const history = useHistory();
  
  // Dialog state
  const [open, setOpen] = useState(false);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
  // Snack state
  const [snack, showSnack] = useState(false);
  const [friendSuccess, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Sucesso!");
  const [errorMsg, setErrorMsg] = useState("");  

  const unfriend = (friend) => (event) => {
    console.log("execute unfriend logic");
    console.log(friend);

    fetch("/api/friend/remove?username=" + friend.userInfo.username, {
      method: 'DELETE',
      headers: {
        'Authorization': sessionStorage.getItem('token')
      }
    })
    .then(
      (res) => {
        if (res.status === 204) {
          setSuccess(true);
          setSuccessMsg('Amizade desfeita com sucesso!');
          showSnack(true);
        } else if (res.status === 403) {
          history.push("/login");
          return;
        } else {
          throw new Error('Unexpected server response' + res.status);
        }
      },
      (error) => {
        setErrorMsg(error.message);
        showSnack(true);
      }
    );

    // Refetch friends
    setLoaded(false);

    setOpen(false);
  };

  // Fetches friends from API
  const fetchFriends = () => {
    fetch("/api/friend", {
      method: 'GET',
      headers: {
        'Authorization': sessionStorage.getItem('token')
      }
    })
    .then(res => {
      if (res.ok) {
        return res;
      } else if (res.status === 403) {
        history.push("/login");
        return;        
      } else {
        console.log('Unexpected response status: ' + res.status);
        return;
      }
    })
    .then(res => res.json())
    .then(
      (result) => {
        const newFriends = result._embedded;
        if (newFriends === undefined) {
          setFriends([]);
        } else {
          setFriends(newFriends.appUserList);
        }
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setFriends([]);
        setLoaded(true);
      }
    )
  }

  useEffect(() => {
    fetchFriends();
  }, [loaded])
  

  const openDialog = () => {
    setOpen(true);
  }

  const closeDialog = () => {
    setOpen(false);
  }
 
  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid container justify="center" >
        <List className={classes.root}>
          {friends.map(friend => (
            <ListItem button key={friend}>
              <ListItemText
                
                primary={friend.userInfo.name}
                secondary={friend.userInfo.username}
              />
              <ListItemIcon edge="end">
                <IconButton onClick={openDialog}>
                  <RemoveCircleOutline color="error" />
                </IconButton>
              </ListItemIcon>
              <Dialog open={open}>
                <DialogTitle>
                  Deseja desfazer a amizade?
                </DialogTitle>
                <DialogActions>
                  <Button color="primary" onClick={unfriend(friend)}>
                    Aceitar
                  </Button>
                  <Button color="primary" onClick={closeDialog}>
                    Cancelar
                  </Button>
                </DialogActions>
              </Dialog>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid container justify="flex-end">
        <Fab color="primary" aria-label="add">
          <Add />
        </Fab>
      </Grid>
      <Grid>
          <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
            {friendSuccess
              ? <Alert severity="success">{successMsg}</Alert>
              : <Alert severity="error" >{errorMsg}</Alert>
          }
        </Snackbar>
      </Grid>

    </Grid>
  );

 
}