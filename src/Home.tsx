import React, { SyntheticEvent, useEffect, useState } from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Drawer from '@material-ui/core/Drawer';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { AccountCircle, CalendarToday, ChevronLeft, DateRange, Event, People } from '@material-ui/icons';

import Calendar from 'calendar/Calendar';
import { Link, Route, Switch, Redirect, useRouteMatch, useHistory } from 'react-router-dom';
import Shifts from 'shifts/Shifts';
import Friends from 'friends/Friends';
import Account from 'account/Account';

import { EventSourcePolyfill } from 'event-source-polyfill';
import { useLogout } from 'model/user_model';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    //marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function Home() {
  const classes = useStyles();
  const history = useHistory();
  const [title, setTitle] = useState("Minha Escala");

  const logout = useLogout();

  // Allows use of relative paths for nested contents
  let match = useRouteMatch();

  // Drawer state
  const [open, setOpen] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<Element | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<string[]>([]);
  const [newNotifications, setNewNotifications] = useState(0);

  // Helper functions
  const changeTitle = (newTitle: string) => {
    setTitle(newTitle);
  }

  const redirectAccount = () => history.push("/home/account");

  const handleLogout = () => {
    logout();
    handleMenuClose();
  }

  const subscribePush = () => {
    const username = sessionStorage.getItem('loggedUsername');
    const token = sessionStorage.getItem('token');
    var es = new EventSourcePolyfill(
      '/api/push/subscribe/' + username,
      {
        headers: {
          "Authorization": token,
        }
      }
    );

    es.onerror = () => es.close();
    es.addEventListener("FRIEND_REQUEST", (e: any) => handleFriendRequestEvent(e));
    es.addEventListener("FRIEND_ACCEPT", (e: any) => handleFriendAcceptEvent(e));
  }

  const handleFriendRequestEvent = function (event: any) {
    const username = sessionStorage.getItem("loggedUsername");
    const data = JSON.parse(event.data);
    const source = data.source;
    if (source !== username) {
      var note = `${source} solicitou sua amizade!`;
      var newNotifs = notifications.concat(note);
      setNotifications(newNotifs);
      setNewNotifications(newNotifications + 1);
    }
  }

  const handleFriendAcceptEvent = function (event: any) {
    const username = sessionStorage.getItem("loggedUsername");
    const data = JSON.parse(event.data);
    const source = data.source;
    if (source !== username) {
      var note = `${source} aceitou sua solicitação!`;
      var newNotifs = notifications.concat(note);
      setNotifications(newNotifs);
      setNewNotifications(newNotifications + 1);
    }
  }

  useEffect(() => {
    subscribePush();
  }, []);


  // Drawer handler
  const toggleDrawer = (open: boolean) => (event: SyntheticEvent) => {
    setOpen(open);
  }

  // Menu handlers
  const handleMenuOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  }

  const handleNotifMenuOpen = (event: SyntheticEvent) => {
    setNotifAnchorEl(event.currentTarget);
    setNewNotifications(0);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  }

  return (
    <div className='root'>
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open menu"
            onClick={toggleDrawer(true)}
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          <IconButton onClick={handleNotifMenuOpen} color="inherit">
            <Badge
              badgeContent={newNotifications}
              color="error"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle id="account-circle" />
          </IconButton>
          <Menu
            id="menu-notifications"
            anchorEl={notifAnchorEl}
            keepMounted
            open={Boolean(notifAnchorEl)}
            onClose={handleMenuClose}
          >
            {notifications.map((notif, index) => <MenuItem key={index}>{notif}</MenuItem>)}
          </Menu>
          <Menu
            id="menu-account"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              {sessionStorage.getItem("loggedUsername")}
            </MenuItem>
            <Divider />
            <MenuItem onClick={redirectAccount}>
              Minha Conta
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper
        }}
        onKeyDown={toggleDrawer(false)}
        onClick={toggleDrawer(false)}
      >
        <div className={classes.drawerHeader}>
          <IconButton
            onClick={toggleDrawer(false)}
          >
            <ChevronLeft />
          </IconButton>
        </div>
        <Divider />
        <List onClick={toggleDrawer(false)}>
          <ListItem button key="calendar"
            component={Link}
            to={`${match.url}/calendar`}
          >
            <ListItemIcon><CalendarToday /></ListItemIcon>
            <ListItemText primary="Calendário" />
          </ListItem>
          <ListItem button key="shifts"
            component={Link}
            to={`${match.url}/shifts`}
          >
            <ListItemIcon><DateRange /></ListItemIcon>
            <ListItemText primary="Escalas" />
          </ListItem>
          {/* 
                    <ListItem button key="events"
                      component={Link}
                      to={`${match.url}/events`}
                    >
                        <ListItemIcon><Event /></ListItemIcon>
                        <ListItemText primary="Eventos"/>
                    </ListItem>
                    */}
          <ListItem button key="friends"
            component={Link}
            to={`${match.url}/friends`}
          >
            <ListItemIcon><People /></ListItemIcon>
            <ListItemText primary="Amigos" />
          </ListItem>
        </List>
      </Drawer>
      <div className={classes.drawerHeader} />
      <main className={classes.content}>
        <Switch>
          <Route path={`${match.path}/calendar`}>
            <Calendar changeTitle={changeTitle} />
          </Route>
          <Route path={`${match.path}/shifts`}>
            <Shifts changeTitle={changeTitle} />
          </Route>
          <Route path={`${match.path}/events`}>
          </Route>
          <Route path={`${match.path}/friends`}>
            <Friends changeTitle={changeTitle} />
          </Route>
          <Route exact path={match.path}>
            <Redirect to={`${match.path}/calendar`} />
          </Route>
          <Route exact path={`${match.path}/account`}>
            <Account changeTitle={changeTitle} />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

function Notification() {

}