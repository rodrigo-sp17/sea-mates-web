import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Container, Dialog, DialogContent, Divider, Grid, IconButton, List, ListItem, ListItemText, ListSubheader, Toolbar, Typography } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import { availableFriendsQuery } from 'api/model/friend_model';
import { TransitionProps } from '@material-ui/core/transitions';
import { Slide } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import CenterLoadingScreen from 'view/components/CenterLoadingScreen';
import FriendProfileDialog from 'view/friends/FriendProfileDialog';
import Friend from 'api/data/friend';

EventDialog.propTypes = {
  date: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FriendList({ date }: any) {
  const friends = useRecoilValue(availableFriendsQuery(date));
  const [open, setOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend>(new Friend());

  const handleClick = (friend: Friend) => () => {
    setSelectedFriend(friend);
    setOpen(true);
  }

  const onClose = () => {
    setOpen(false);
  }

  return (
    <React.Suspense fallback={<CenterLoadingScreen />}>
      {friends.length === 0
        ? <Grid xs container justify="center" alignItems="center">
          <Typography variant="body2">Nenhum amigo disponível</Typography>
        </Grid>
        : friends.map((friend: Friend) => (
          <ListItem button onClick={handleClick(friend)} divider alignItems="flex-start" key={friend.userId}>
            <ListItemText primary={friend.name} secondary={
              <div>
                <div>{friend.username}</div>
                <div>{friend.email}</div>
              </div>
            } />
          </ListItem>
        ))}
      <FriendProfileDialog open={open} friend={selectedFriend} onClose={onClose} />
    </React.Suspense>
  )
}

export default function EventDialog(props: any) {
  const { open, onClose, date } = props;
  const parsedDate = new Date(date);

  const handleClose = () => {
    onClose();
  }

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar position="relative">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="close" onClick={handleClose}>
            <Close />
          </IconButton>
          <Typography variant="h6">
            {`Dia ${parsedDate.toLocaleDateString("pt-br")}`}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Container disableGutters>
          <List subheader={<ListSubheader>Amigos em terra</ListSubheader>}>
            <FriendList date={parsedDate} />
          </List>
          <Divider />
          <List subheader={<ListSubheader>Eventos</ListSubheader>}>
            <Grid container xs justify="center" alignItems="center">
              <Typography variant="body1">-</Typography>
            </Grid>
          </List>
        </Container>
      </DialogContent>
    </Dialog>
  );
}