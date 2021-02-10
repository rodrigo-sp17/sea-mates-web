import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar, Checkbox, Fab, Grid, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, TableContainer, Typography } from '@material-ui/core';
import { Add, Delete, Edit } from '@material-ui/icons';
import { Link } from 'react-router-dom';


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}


export default function Shifts(props) {
    const [checked, setChecked] = React.useState([0]);
    const history = useHistory();


    const successDeleteMsg = "Escala(s) deletada(s)!";
    const [errorMsg, setErrorMsg] = useState("");
    const [shiftSuccess, setSuccess] = useState(false);
    const [snack, showSnack] = useState(false);
    
    const deleteShift = (event) => {
        event.preventDefault();
        //validate();
        
        checked.forEach(id => {                       
            fetch("/api/shift/remove?id=" + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Authorization': sessionStorage.getItem("token")
                }
            })
            .then(res => {
                if (res.status === 204) {
                    setSuccess(true);
                    showSnack(true);
                    setTimeout(() => { history.push('/home/shifts'); }, 2000);
                } else if (res.status === 403) {
                    history.push('/login');                    
                    throw new Error('Usuário não logado!');
                } else {
                    throw res;
                }
            })
            .catch(err => {
                setErrorMsg(err.message);
                showSnack(true);
            });
        });
    };


    // Handles the toggling of list items
    const handleToggle = (shift) => () => {
        const currentIndex = checked.indexOf(shift.shiftId);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(shift.shiftId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };


    return (
        <Grid container direction="column" alignItems="stretch">
            <Grid container justify="center">
                <List>
                    {props.shifts.map(shift => (
                        <ListItem key={shift} button onClick={handleToggle(shift)}>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={checked.indexOf(shift.shiftId) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Typography variant="h6">
                                    {shift.shiftId}
                                </Typography>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={`de ${shift.unavailabilityStartDate} até ${shift.unavailabilityEndDate}`}
                            />                        
                        </ListItem>
                    ))}
                </List>
            </Grid>
            <Grid container justify="flex-end">
                <Fab 
                    color="primary" 
                    aria-label="add"
                    component={Link}
                    to="/shift"
                >
                    <Add />
                </Fab>
                <Fab color="default" disabled={true} aria-label="edit">
                    <Edit />
                </Fab>
                <Fab color="secondary" aria-label="delete" onClick={deleteShift}>
                    <Delete />
                </Fab>
            </Grid>
            <Grid>
                <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
                            {shiftSuccess
                                ? <Alert severity="success">{successDeleteMsg}</Alert>
                                : <Alert severity="error" >{errorMsg}</Alert>
                            }
                </Snackbar>
            </Grid>
        </Grid>
        );
}