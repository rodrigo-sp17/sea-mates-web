import { Slide, Dialog, AppBar, Toolbar, IconButton, Typography, List, Grid, Divider, ListItemText, ListItem, makeStyles, Container, Avatar } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import { Close } from "@material-ui/icons";
import Friend from "api/data/friend";
import Shift from "api/data/shift";
import React, { forwardRef } from "react";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean,
  friend: Friend,
  onClose: () => void
}

const useStyles = makeStyles(theme => ({
  paper: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    padding: theme.spacing(2)
  },
  header: {
    alignSelf: 'center'
  },
  logo: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  profile: {
    marginBottom: theme.spacing(4)
  }
}))

export default function FriendProfileDialog({ open, friend, onClose }: Props) {
  const classes = useStyles();

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar position="relative">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="close" onClick={onClose}>
            <Close />
          </IconButton>
          <Typography variant="h6" >
            {`Perfil de ${friend.name}`}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container className={classes.paper}>
        <Grid container direction="column" alignItems="center" className={classes.profile}>
          <Avatar className={classes.logo} />
          <Typography variant="h5">{friend.name}</Typography>
          <Typography>{friend.username}</Typography>
          <Typography>{friend.email}</Typography>
        </Grid>
        <Grid>
          <Typography variant="subtitle1">
            Escalas
        </Typography>
          <Divider />
          <List disablePadding>
            {friend.shifts.map((shift: Shift) => 
              <ListItem
                divider
                key={shift.shiftId}>
                <ListItemText
                  primary={`${shift.unavailabilityStartDate} --> ${shift.unavailabilityEndDate}`}
                />
              </ListItem>
            )}
          </List>
        </Grid>
      </Container>
    </Dialog>
  );
}