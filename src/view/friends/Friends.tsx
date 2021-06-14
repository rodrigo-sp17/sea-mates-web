import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Snackbar, Fab, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, ListSubheader, ListItemSecondaryAction, Container } from '@material-ui/core';
import { Add, Delete, DirectionsBoat, Home, HourglassEmpty, PersonAdd, PriorityHigh } from '@material-ui/icons';
import Alert from '../components/Alert';
import RequestDialog from './RequestDialog';
import { isAfter, isBefore } from 'date-fns';
import Shift from 'api/data/shift';
import { friendListState, requestListState, useFriendModel } from 'api/model/friend_model';
import { useRecoilValue } from 'recoil';
import FriendRequest from 'api/data/friend_request';
import Friend from 'api/data/friend';
import FriendProfileDialog from './FriendProfileDialog';
import DeleteDialog from './DeleteDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 1200,
  },
  fab: {
    position: 'fixed',
    left: 'auto',
    right: 20,
    bottom: 20,
    zIndex: 100
  },
  list: {
    marginBottom: theme.spacing(2)
  }
}));

export default function Friends(props: any) {
  const classes = useStyles();
  const { requestFriendship, acceptFriendship, unfriend, loadAll } = useFriendModel();

  // Dialog state
  const [open, setOpen] = useState({
    requestDialog: false,
    deleteDialog: false,
    profileDialog: false,
  });

  // Friends state
  const { myRequests, otherRequests } = useRecoilValue(requestListState);
  const friends = useRecoilValue(friendListState);
  const [selectedFriend, setSelectedFriend] = useState(new Friend());

  // Snack state
  const [snack, showSnack] = useState(false);
  const [friendSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Changes parent title
  useEffect(() => {
    props.changeTitle("Amigos");
  }, [])

  useEffect(() => {
    loadAll();
  }, []);

  const handleProfileClick = (friend: Friend) => () => {
    setSelectedFriend(friend);
    setOpen({ ...open, profileDialog: true });
  }

  const handleProfileClose = () => {
    setOpen({ ...open, profileDialog: false });
  }


  const handleRequestClick = () => {
    setOpen({ ...open, requestDialog: true });
  }

  const handleRequestClose = async (username: string | null) => {
    setOpen({ ...open, requestDialog: false });
    if (username == null || username === "") return;

    const errorMsg = await requestFriendship(username);
    if (errorMsg) {
      setMessage(errorMsg);
      setSuccess(false);
    } else {
      setMessage("Amizade solicitada!");
      setSuccess(true);
    }
    showSnack(true);
  }


  const handleAcceptFriend = (username: string) => async () => {
    if (username == null || username === "") return;

    const errorMsg = await acceptFriendship(username);
    if (errorMsg) {
      setMessage(errorMsg);
      setSuccess(false);
    } else {
      setMessage("Amizade aceita!");
      setSuccess(true);
    }
    showSnack(true);
  }

  
  const handleUnfriendClick = (friend: Friend) => () => {
    setSelectedFriend(friend);
    setOpen({ ...open, deleteDialog: true });
  }

  const handleUnfriendClose = async (username: string | null) => {
    setOpen({ ...open, deleteDialog: false });
    if (username == null || username === "") return;

    const errorMsg = await unfriend(username);
    if (errorMsg) {
      setMessage(errorMsg);
      setSuccess(false);
    } else {
      setMessage(`Amizade desfeita com ${username}!`);
      setSuccess(true);
    }
    showSnack(true);
  }

  // Returns true if today is outside the shifts, or false if it is inside
  const isAvailableNow = (shifts: Shift[]) => {
    const now = new Date();
    return shifts.every((shift) => {
      const startDate = shift.unavailabilityStartDate;
      const endDate = shift.unavailabilityEndDate;
      console.log(now);
      const isBef = isBefore(now, startDate);
      const isAft = isAfter(endDate, now);
      console.log(isBef);
      console.log(isAft);
      return isBefore(now, startDate) || isAfter(now, endDate);
    })
  }

  return (
    <Container disableGutters className={classes.root} >
      <List disablePadding subheader={<ListSubheader>Solicitações</ListSubheader>}>
        {otherRequests.map((request: FriendRequest) => {
          return (
            <ListItem alignItems="center" disableGutters key={request.id}>
              <ListItemIcon><PriorityHigh /></ListItemIcon>
              <ListItemText
                primary={request.sourceName}
                secondary={
                  <div>
                    <div>{request.sourceUsername}</div>
                    <div>Requisitado em {request.timestamp.toLocaleString("pt-br")}</div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <IconButton color="primary" onClick={handleAcceptFriend(request.sourceUsername)}>
                  <PersonAdd />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
      <List disablePadding className={classes.list}>
        {myRequests.map((request: FriendRequest) => (
          <ListItem divider alignItems="center" disableGutters key={request.id}>
            <ListItemIcon><HourglassEmpty /></ListItemIcon>
            <ListItemText
              primary={request.targetName}
              secondary={<div>
                <div>{request.targetUsername}</div>
                <div>Requisitado em {request.timestamp.toLocaleString("pt-br")}</div>
              </div>}
            />

          </ListItem>)
        )}
      </List>
      <Divider />
      <List subheader={<ListSubheader>Amizades</ListSubheader>} className={classes.list}>
        {friends.map((friend: Friend) => (
          <ListItem divider
            alignItems="center"
            disableGutters
            button
            key={friend.userId}
            onClick={handleProfileClick(friend)}
          >
            <ListItemIcon>
              {isAvailableNow(friend.shifts)
                ? <Home />
                : <DirectionsBoat />
              }
            </ListItemIcon>
            <ListItemText
              primary={friend.name}
              secondary={
                <div>
                  <div>{friend.username}</div>
                  <div>{friend.email}</div>
                </div>
              }
            />
            <ListItemSecondaryAction >
              <IconButton onClick={handleUnfriendClick(friend)}>
                <Delete color="error" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Grid container justify="flex-end" className={classes.fab}>
        <Fab color="primary" aria-label="add" onClick={handleRequestClick}>
          <Add />
        </Fab>
      </Grid>
      <Grid>
        <Snackbar open={snack} autoHideDuration={3000} onClose={() => showSnack(false)} >
          {friendSuccess
            ? <Alert severity="success">{message}</Alert>
            : <Alert severity="error" >{message}</Alert>
          }
        </Snackbar>
      </Grid>
      <RequestDialog onClose={handleRequestClose} open={open.requestDialog} />
      <DeleteDialog onClose={handleUnfriendClose} open={open.deleteDialog} friend={selectedFriend} />
      <FriendProfileDialog onClose={handleProfileClose} open={open.profileDialog} friend={selectedFriend} />
    </Container>
  );
}