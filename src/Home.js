import React from 'react';
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
import { Divider, List, ListItem, ListItemIcon, ListItemText, Button } from '@material-ui/core';
import { Add, CalendarToday, ChevronLeft, DateRange, Event, People } from '@material-ui/icons';

import Calendar from './Calendar.js';
import { Link, Route, Switch } from 'react-router-dom';


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
    // Title
    // Sidebar
    // Calendar
    //import classes from '*.module.css';
    const classes = useStyles();   
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    }

    const handleDrawerClose = () => {
        setOpen(false);
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
                        onClick={handleDrawerOpen}
                        className={clsx(classes.menuButton, open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Calendário    
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/shift"
                      startIcon={<Add />}
                    >
                      Nova escala
                    </Button>
                    <IconButton color="inherit" >
                        <Badge badgeContent={0} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="responsive"
                anchor="left"
                open={open}
                className={classes.drawer}
                classes={{
                    paper: classes.drawerPaper
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton
                        onClick={handleDrawerClose}
                    >
                        <ChevronLeft />
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItem button key="calendar"
                      component={Link}
                      to="/calendar"
                    >
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText primary="Calendário"/>
                    </ListItem>
                    <ListItem button key="shifts">
                        <ListItemIcon><DateRange /></ListItemIcon>
                        <ListItemText primary="Escalas"/>
                    </ListItem>
                    <ListItem button key="events">
                        <ListItemIcon><Event /></ListItemIcon>
                        <ListItemText primary="Eventos"/>
                    </ListItem>
                    <ListItem button key="friends">
                        <ListItemIcon><People /></ListItemIcon>
                        <ListItemText primary="Amigos"/>
                    </ListItem>
                </List>
            </Drawer>
            <div className={classes.drawerHeader} />
            <main className={classes.content}>
              <Switch>
                <Route exact path="/calendar">
                  <Calendar />                            
                </Route>
                <Route path="/shifts">

                </Route>
                <Route path="/events">

                </Route>
              </Switch>
            </main>
          </div>
    );
}