import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Alert from 'components/Alert.js';
import { Snackbar, Checkbox, Fab, Grid, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, TableContainer, Typography } from '@material-ui/core';
import { Add, Delete, Edit } from '@material-ui/icons';
import { Link } from 'react-router-dom';

export default function Shifts(props) {
    const history = useHistory();
    
    // Shift selection state (through checkbox)
    const [checked, setChecked] = React.useState([0]);
    
    // Snack state
    const [snack, showSnack] = useState(false);
    const [shiftSuccess, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("Sucesso!");
    const [errorMsg, setErrorMsg] = useState("");

    // Changes parent title
    useEffect(() => {
        props.changeTitle("Escalas");
    }, [])
    
    // Shift deletion state
    const successDeleteMsg = "Escala(s) deletada(s)!";
    
    const deleteShift = (event) => {
        event.preventDefault();
        //validate();

        if (checked.length === 1) {
            setSuccess(false);
            setErrorMsg("Nenhuma escala selecionada!");
            showSnack(true);
            return;
        }

        checked.forEach(id => {          
            if (id === 0) return;             
            fetch("/api/shift/remove?id=" + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Authorization': sessionStorage.getItem("token")
                }
            })
            .then(res => {
                switch (res.status) {
                    case 204:
                      setSuccess(true);
                      setSuccessMsg(successDeleteMsg);
                      showSnack(true);
                      setTimeout(() => { history.push('/home/shifts'); }, 2000);
                      break;
                    case 403:
                      history.push('/login');                    
                      throw new Error('Usuário não logado!');
                    case 404:
                      throw new Error('Escala não encontrada no servidor!');
                    default:
                      throw new Error('Unexpected server response: ' + res.status);
                }
            })
            .catch(err => {
                setSuccess(false);
                setErrorMsg(err.message);
                showSnack(true);
            });
        });

        // Forces reloading of shifts after modification
        props.fetchShifts();
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
                    {props.shifts === null ? [] : props.shifts.map(shift => (
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
                                ? <Alert severity="success">{successMsg}</Alert>
                                : <Alert severity="error" >{errorMsg}</Alert>
                            }
                </Snackbar>
            </Grid>
        </Grid>
        );
}