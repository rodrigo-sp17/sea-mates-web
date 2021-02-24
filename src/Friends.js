import {React, useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {useHistory} from 'react-router-dom';
import { Snackbar, Button, Dialog, DialogActions, DialogTitle, Fab, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@material-ui/core';
import { Add, RemoveCircleOutline} from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';
import RequestDialog from './RequestDialog';
import { isAfter, isBefore } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,    
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Friends(props) {
  const classes = useStyles();
  const history = useHistory();

  // Needed for filtering the requests from the server
  const loggedUsername = sessionStorage.getItem('loggedUsername');
  
  // Dialog state
  const [open, setOpen] = useState({
    requestDialog: false,
    deleteDialog: false,
  });
  
  // Friends state
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadedFriends, setLoadedFriends] = useState(false);
  const [loadedRequests, setLoadedRequests] = useState(false);
  
  // Snack state
  const [snack, showSnack] = useState(false);
  const [friendSuccess, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Sucesso!");
  const [errorMsg, setErrorMsg] = useState("");  

  // Changes parent title
  useEffect(() => {
    props.changeTitle("Amigos");
  }, [])
  
  // API interaction functions
  const requestFriendship = (username) => {
    if (username !== null && username !== "") {
      fetch("/api/friend/request?username=" + username, {
        method: 'POST',
        headers: {
          'Authorization': sessionStorage.getItem('token')
        }
      })
      .then(
        (res) => {
          switch (res.status) {
            case 201:
              setSuccessMsg('Amizade requisitada! Aguardando aprovação...');
              setSuccess(true);
              showSnack(true);
              break;
            case 403:
              history.push('/login');
              break;
            case 400:
              setErrorMsg('Não é possível ser amigo de si mesmo! Tente novamente.');
              setSuccess(false);
              showSnack(true);
              break;
            case 404:
              setErrorMsg('Usuário não encontrado!');
              setSuccess(false);
              showSnack(true);
              break;
            default:
              setErrorMsg('Resposta inesperada do servidor: ' + res);
              setSuccess(false);
              showSnack(true);
          }
        },
        (error) => {
          setErrorMsg(error.message);
          setSuccess(false);
          showSnack(true);
        }
      );
    }

    setLoadedRequests(false);

    // Closes dialog
    setOpen({ ...open, requestDialog: false});
  }

  const acceptFriend = (username) => (event) => {
    fetch("/api/friend/accept?username=" + username, {
      method: 'POST',
      headers: {
        'Authorization': sessionStorage.getItem('token')
      }
    })
    .then(
      (result) => {
        switch (result.status) {
          case 200:
            setSuccessMsg('Amizade aceita!');
            setSuccess(true);
            showSnack(true);
            break;
          case 403:
            history.push('/login');
            return;
          default:
            setErrorMsg("Resposta inesperada do servidor" + result.status);
            setSuccess(false);
            showSnack(true);
        }
      },
      (error) => {
        setErrorMsg(error.message);
        setSuccess(false);
        showSnack(true);
      }
    );

    setLoadedFriends(false);
    setLoadedRequests(false);
  }
  
  const unfriend = (username) => (event) => {
    fetch("/api/friend/remove?username=" + username, {
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
          setErrorMsg('Resposta inesperada do servidor: ' + res.status);
          setSuccess(false);
          showSnack(true);
        }
      },
      (error) => {
        setErrorMsg(error.message);
        setSuccess(false);
        showSnack(true);
      }
    );

    // Refetch friends
    setLoadedFriends(false);

    // Closes delete dialog
    setOpen({ ...open, deleteDialog: false});
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
        return new Error("Forbidden");        
      } else {
        console.log('Unexpected response status: ' + res.status);
        return new Error(res);
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
      },
      (error) => {
        console.log(error);
        setFriends([]);
      }
    )
  }
    
  // Fetches friend requests from API
  const fetchRequests = () => {
    fetch('/api/friend/request', {
      method: 'GET',
      headers: {
        'Authorization': sessionStorage.getItem('token')
      }
    })
    .then(res => {
      switch (res.status) {
        case 200:
          return res.json();
        case 403:
          history.push('/login');
          return new Error("User not logged");
        default:
          console.log('Unexpected response status: ' + res.status);
          return new Error(res);
      }
    })
    .then(
      (result) => {
        const newRequests = result._embedded;
        if (newRequests === undefined) {
          setRequests([]);
        } else {
          setRequests(newRequests.friendRequestDTOList);
        }
      }, 
      (error) => {
        console.warn(error);
      }
    )
  }
  
  // Fetches state from API
  useEffect(() => {
    fetchFriends();
    setLoadedFriends(true);
  }, [loadedFriends])
  
  useEffect(() => {
    fetchRequests();
    setLoadedRequests(true);
  }, [loadedRequests])
  
  const toggleDialog = (dialog, open) => (event) => {
    setOpen({ ...open, [dialog]: open });
  }
  
  // Returns true if today is outside the shifts, or false if it is inside
  const isAvailableNow = (shifts) => {
    const now = Date.now();
    return shifts.every((shift) => {
      const startDate = new Date(shift.unavailabilityStartDate);
      const endDate = new Date(shift.unavailabilityEndDate);

      return isBefore(now, startDate) && isAfter(now, endDate);
    })
  }

  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid container direction="column" alignItems="center">
        <List className={classes.root}>
          {requests.map(request => (
            request.sourceUsername === loggedUsername
            ?
            <ListItem button key={request}> 
                <ListItemText inset
                  primary={request.targetUsername}
                  secondary={`Requisitado em ${new Date(request.timestamp).toLocaleString()}`}
                  />                  
                <ListItemIcon >
                  <Button edge="end" color="primary">Aguardando aprovação</Button>
                </ListItemIcon>
              </ListItem>
            :
            <ListItem button key={request}> 
                <ListItemText inset
                  primary={request.sourceUsername}
                  secondary={`Requisitado em ${new Date(request.timestamp).toLocaleString()}`}
                  />    
                <ListItemIcon>
                  <Button color="primary" onClick={acceptFriend(request.sourceUsername)}>Aceitar</Button> 
                </ListItemIcon>
              </ListItem>                           
          ))}
        </List>
        <Divider />
        <List className={classes.root}>
          {friends.map(friend => (
            <ListItem button key={friend}>
              <ListItemText inset             
                primary={friend.userInfo.name}
                secondary={friend.userInfo.username}
              />
              <ListItemText>
                {isAvailableNow(friend.shifts) 
                ? <Chip color="primary" label="Disponível" />
                : <Chip color="secondary" label="Embarcado" />
                }
              </ListItemText>
              <ListItemIcon edge="end">
                <IconButton onClick={toggleDialog('deleteDialog', true)}>
                  <RemoveCircleOutline color="error" />
                </IconButton>
              </ListItemIcon>
              <Dialog open={open['deleteDialog']}>
                <DialogTitle>
                  Deseja desfazer a amizade?
                </DialogTitle>
                <DialogActions>
                  <Button autoFocus color="primary" onClick={unfriend(friend)}>
                    Aceitar
                  </Button>
                  <Button color="primary" onClick={toggleDialog('deleteDialog', false)}>
                    Cancelar
                  </Button>
                </DialogActions>
              </Dialog>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid container justify="flex-end">
        <Fab color="primary" aria-label="add" onClick={toggleDialog('requestDialog', true)}>
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
      <RequestDialog onClose={requestFriendship} open={open.requestDialog}/>
    </Grid>
  );

 
}