import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

EventDialog.propTypes = {
  date: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function EventDialog(props: any) {
  const { open, onClose, date } = props;
  const parsedDate = new Date(date);
  const history = useHistory();

  const [friends, setFriends] = useState<any>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchAvailableFriends = () => {
    fetch("/api/calendar/available?date=" + parsedDate.toISOString().substr(0, 10), {
      method: 'GET',
      headers: {
        'Authorization': sessionStorage.getItem('token') || ""
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 403) {
        history.push("/login");
        return new Error("User not logged");        
      } else {
        setFriends([]);
        return new Error("Error fetching friends: " + res.status);
      }      
    })
    .then(
      (result) => {
        if (result._embedded === undefined) {
          setFriends([]);
        } else {
          setFriends(result._embedded.appUserList);
        }
      },
      (error) => {
        setFriends([]);
      }
    )
  }

  useEffect(() => {
    fetchAvailableFriends();
    return () => setLoaded(true);
  }, [loaded]);

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle>
        {`Dia ${parsedDate.toLocaleDateString()}`}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container  direction="column" spacing={3}>
          <Grid item>
            <Typography variant="subtitle1">Amigos em terra</Typography>
            </Grid>
          <Grid item>
            {friends.length === 0
              ? <Typography variant="h6">Nenhum amigo disponível</Typography>
              : 
                <List disablePadding>
                  {friends.map((friend: any) => (
                    <ListItem dense key={friend}>
                      <ListItemText primary={friend.userInfo.name} />
                    </ListItem>
                  ))}
                </List>
            }
          </Grid>
          <Grid item><Divider /></Grid>          
          <Grid item>
            <Typography variant="subtitle1">Eventos</Typography>
          </Grid>
          <Grid item container xs justify="center" alignItems="center">
            <Typography variant="body1">-</Typography>          
          </Grid>  
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>  
  );
}