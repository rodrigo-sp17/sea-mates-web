import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItem, ListItemText, Typography } from '@material-ui/core';

EventDialog.propTypes = {
  date: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function EventDialog(props) {
  const { open, onClose, date } = props;
  const parsedDate = new Date(date);

  const [friends, setFriends] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchAvailableFriends = () => {
    fetch("/api/calendar/available?date=" + parsedDate.toISOString().substr(0, 10), {
      method: 'GET',
      headers: {
        'Authorization': sessionStorage.getItem('token')
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        console.log("Error fetching friends" + res.status);
        setFriends([]);
      }      
    })
    .then(
      (result) => {
        if (result === undefined) {
          setFriends([]);
        } else {
          setFriends(result._embedded.appUserList);
        }
      },
      (error) => {
        console.log(error.message);
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
                  {friends.map(friend => (
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