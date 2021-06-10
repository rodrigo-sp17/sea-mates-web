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
import { Divider, Hidden, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core';
import { AccountCircle, CalendarToday, DateRange, ExitToApp, People } from '@material-ui/icons';

import Calendar from 'view/calendar/Calendar';
import { Link, Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';
import Shifts from 'view/shifts/Shifts';
import Friends from 'view/friends/Friends';
import Account from 'view/account/Account';

import { EventSourcePolyfill } from 'event-source-polyfill';
import { useUserModel } from 'api/model/user_model';
import CenterLoadingScreen from './components/CenterLoadingScreen';


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
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'center',
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
  },
}));

export default function Home() {
  const classes = useStyles();
  const [title, setTitle] = useState("Minha Escala");

  const { logout } = useUserModel();

  // Allows use of relative paths for nested contents
  let match = useRouteMatch();

  // Drawer state
  const [open, setOpen] = useState(false);

  // Menu state
  const [notifAnchorEl, setNotifAnchorEl] = useState<Element | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<string[]>([]);
  const [newNotifications, setNewNotifications] = useState(0);

  // Helper functions
  const changeTitle = (newTitle: string) => {
    setTitle(newTitle);
  }

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
  const handleNotifMenuOpen = (event: SyntheticEvent) => {
    setNotifAnchorEl(event.currentTarget);
    setNewNotifications(0);
  }

  const handleMenuClose = () => {
    setNotifAnchorEl(null);
  }

  const drawer = (
    <div >
      <div className={classes.drawerHeader} />
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
        <Divider />
        <ListItem button key="profile"
          component={Link}
          to={`${match.url}/account`}
        >
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="Minha Conta" />
        </ListItem>
        <ListItem button key="logout" onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className='root'>
      <AppBar
        position="fixed"
        className={classes.appBar}>
        <Toolbar>
          <Hidden smUp>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open menu"
              onClick={toggleDrawer(true)}
              className={clsx(classes.menuButton, open && classes.hide)}>
              <MenuIcon />
            </IconButton>
          </Hidden>
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
          <Menu
            id="menu-notifications"
            anchorEl={notifAnchorEl}
            keepMounted
            open={Boolean(notifAnchorEl)}
            onClose={handleMenuClose}
          >
            {notifications.map((notif, index) => <MenuItem key={index}>{notif}</MenuItem>)}
          </Menu>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden smUp>
          <Drawer
            variant="temporary"
            anchor="left"
            open={open}
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true,
            }}
            onKeyDown={toggleDrawer(false)}
            onClick={toggleDrawer(false)}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown>
          <Drawer
            variant="permanent"
            anchor="left"
            open
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper
            }}
            onKeyDown={toggleDrawer(false)}
            onClick={toggleDrawer(false)}
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <div className={classes.appBarSpacer} />
      <main className={classes.content}>
        <React.Suspense fallback={<CenterLoadingScreen />}>
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
        </React.Suspense>
      </main>
    </div>
  );
}
