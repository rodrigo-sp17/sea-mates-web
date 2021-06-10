import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Container, Dialog, DialogContent, Divider, Grid, IconButton, List, ListItem, ListItemText, ListSubheader, Toolbar, Typography } from '@material-ui/core';
import { useRecoilValue } from 'recoil';
import { availableFriendsQuery } from 'api/model/friend_model';
import { TransitionProps } from '@material-ui/core/transitions';
import { Slide } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import User from 'api/data/user';
import CenterLoadingScreen from 'view/components/CenterLoadingScreen';

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

  return (
    <React.Suspense fallback={<CenterLoadingScreen />}>
      {friends.length === 0
        ? <Grid xs container justify="center" alignItems="center">
          <Typography variant="body2">Nenhum amigo disponível</Typography>
        </Grid>
        : friends.map((friend: User) => (
          <ListItem divider alignItems="flex-start" key={friend.userId}>
            <ListItemText primary={friend.name} secondary={`${friend.username}\n${friend.email}`} />
          </ListItem>
        ))}
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
            {`Dia ${parsedDate.toLocaleDateString()}`}
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