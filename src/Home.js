import {React, useEffect, useState} from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Drawer from '@material-ui/core/Drawer';
//import Hidden from '@material-ui/core/Hidden';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Button, Menu, MenuItem } from '@material-ui/core';
import { AccountCircle, Add, CalendarToday, ChevronLeft, DateRange, Event, People } from '@material-ui/icons';

import Calendar from './Calendar.js';
import { Link, Route, Switch, Redirect, useRouteMatch, useHistory } from 'react-router-dom';
import Shifts from './Shifts.js';
import Friends from './Friends.js';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
        display:'none',
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

    // Allows use of relative paths for nested contents
    let match = useRouteMatch();
    
    // Drawer state
    const [open, setOpen] = useState(false);

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);

    // Shifts state
    const [isLoaded, setIsLoaded] = useState(false);
    const [shifts, setShifts] = useState([]);

    // Helper functions
    const changeTitle = (newTitle) => {
      setTitle(newTitle);
    }

    const logout = () => {
      console.info("Logging out...");
      
      // Cleans session storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("loggedUsername");
      
      // Redirects to login
      history.push("/login");

      handleMenuClose();
    }

    const fetchShifts = () => {
      fetch("/api/shift", {
        method: 'GET',
        headers: {          
          'Authorization': sessionStorage.getItem("token")
        }
      })
      .then(res => {
        if (res.status === 403) {
          history.push("/login");
          return new Error("User not logged");
        } else if (res.ok) {
          return res;
        } else {
          console.log("Unexpected response status: " + res.status);  
        }
      })
      .then(res => res.json())
      .then(
        (result) => {
          const newShifts = result._embedded;
          if (newShifts === undefined) {
            setShifts([]);
          } else {
            setShifts(newShifts.shiftList)
          }
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          console.warn(error);
          setShifts([]);
        }
      );
    }

    useEffect(() => {
      fetchShifts();
    }, []);


    // Drawer handler
    const toggleDrawer = (open) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
      }
      
      setOpen(open);
    }

    // Account menu handlers
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
      setAnchorEl(null);
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
                    <IconButton color="inherit" >
                        <Badge badgeContent={0} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton color="inherit" onClick={handleMenu}>
                      <AccountCircle id="account-circle"/>
                    </IconButton>
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
                      <MenuItem onClick={logout}>
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
                        <ListItemText primary="Calendário"/>
                    </ListItem>
                    <ListItem button key="shifts"
                      component={Link}
                      to={`${match.url}/shifts`}
                    >
                        <ListItemIcon><DateRange /></ListItemIcon>
                        <ListItemText primary="Escalas"/>
                    </ListItem>
                    <ListItem button key="events"
                      component={Link}
                      to={`${match.url}/events`}
                    >
                        <ListItemIcon><Event /></ListItemIcon>
                        <ListItemText primary="Eventos"/>
                    </ListItem>
                    <ListItem button key="friends"
                      component={Link}
                      to={`${match.url}/friends`}
                    >
                        <ListItemIcon><People /></ListItemIcon>
                        <ListItemText primary="Amigos"/>
                    </ListItem>
                </List>
            </Drawer>
            <div className={classes.drawerHeader} />
            <main className={classes.content}>
              <Switch>
                <Route path={`${match.path}/calendar`}>                  
                  <Calendar shifts={shifts} changeTitle={changeTitle}/>
                </Route>                
                <Route path={`${match.path}/shifts`}>
                  <Shifts shifts={shifts} fetchShifts={fetchShifts} changeTitle={changeTitle} />
                </Route>
                <Route path={`${match.path}/events`}>                  
                </Route>
                <Route path={`${match.path}/friends`}>
                  <Friends changeTitle={changeTitle} />
                </Route>                
                <Route exact path={match.path}>
                  <Redirect to={`${match.path}/calendar`} />
                </Route>
              </Switch>
            </main>
          </div>
    );
}