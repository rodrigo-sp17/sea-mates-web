import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import MuiAlert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import {Snackbar,  Button, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, TextField, FormControlLabel, Checkbox, Box, Switch} from '@material-ui/core';
import { ArrowBack, Save } from '@material-ui/icons';

import { Link, Route } from 'react-router-dom';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import DateFnsUtils from '@date-io/date-fns';
import addDays from 'date-fns/addDays';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

// Styling
const useStyles = makeStyles((theme) => ({
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
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    form: {
        marginTop: theme.spacing(1),
    },
    formItems: {
        padding: theme.spacing(1),
    },  
  }));


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function Shift(props) {
    const classes = useStyles();
    const history = useHistory();

    const [unavailableDate, setUnavailableDate] = useState(new Date());
    const [boardingDate, setBoardingDate] = useState(new Date());
    const [leavingDate, setLeavingDate] = useState(new Date());
    const [availableDate, setAvailableDate] = useState(new Date());
    const [cycleDays, setCycleDays] = useState(0);
    const [repeat, setRepeat] = useState(0);

    const [useCycle, setUseCycle] = useState(false);
  
    // Handlers
    const handleUseCycle = (event) => {
        let checked = event.target.checked;
        setUseCycle(checked);
    }

    const handleLeavingDate = (date) => {
        setLeavingDate(date);
        if (!useCycle) {
            setCycleDays(differenceInCalendarDays(date, boardingDate));
        }
    }

    const handleRepeat = (event) => {
        setRepeat(event.target.value);
    }

    const handleCycleDays = (event) =>  {
        let days = event.target.value;
        if (days < 0) days = 0;

        setCycleDays(days);

        // Adds the cycle days to both leaving date and available date
        let newDate = calculateCycle(days);
        setLeavingDate(newDate);
        setAvailableDate(newDate);        
    }

    const calculateCycle = (cycleValue) => {
        const result = addDays(boardingDate, cycleValue);       
        return result;
    }

    const successMsg = "Escala(s) adicionada!";
    const [errorMsg, setErrorMsg] = useState("");
    const [shiftSuccess, setSuccess] = useState(false);
    const [snack, showSnack] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        validate();

        fetch("/api/shift/add", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': sessionStorage.getItem("token")
            },
            body: JSON.stringify({
                "unavailabilityStartDate": unavailableDate,
                "boardingDate": boardingDate,
                "leavingDate": leavingDate,
                "unavailabilityEndDate": availableDate,
                "cycleDays": cycleDays,
                "repeat": repeat
            })
        })
            .then(res => {
                if (res.ok) {
                    setSuccess(true);
                    showSnack(true);
                    setTimeout(() => { history.push('/home'); }, 2000);
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
    };

    const validate = () => {
        // TODO validation
    }


    return (
        <Container component="main">
            <div>
                <AppBar
                    className={classes.appBar}
                    position="absolute" 
                >
                    <Toolbar>
                        <IconButton
                            className={classes.menuButton}
                            edge="start"
                            color="inherit"
                            aria-label="go back"
                            onClick={history.goBack}                           
                        >
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" className={classes.title} >
                            Escala    
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={submit}
                        >
                            Salvar
                        </Button>                    
                    </Toolbar>
                </AppBar>
            </div>
            <div className={classes.header} />
            <Grid container 
                direction='column'
                justify='center'
                className={classes.form}                
            >
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        className={classes.formItems}
                        margin="normal"
                        id="date-unavailable"
                        label="Indisponível a partir de"
                        format="dd/MM/yyyy"
                        value={unavailableDate}
                        onChange={setUnavailableDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    <KeyboardDatePicker
                        className={classes.formItems}
                        margin="normal"
                        id="date-boarding"
                        label="Data de embarque"
                        format="dd/MM/yyyy"
                        value={boardingDate}
                        onChange={setBoardingDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    <KeyboardDatePicker
                        className={classes.formItems}
                        disabled={useCycle}
                        margin="normal"
                        id="date-leaving"
                        label="Data de desembarque"
                        format="dd/MM/yyyy"
                        value={leavingDate}
                        onChange={handleLeavingDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    <KeyboardDatePicker
                        className={classes.formItems}
                        disabled={useCycle}
                        margin="normal"
                        id="date-available"
                        label="Disponivel a partir de:"
                        format="dd/MM/yyyy"
                        value={availableDate}
                        onChange={setAvailableDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />                          
                </MuiPickersUtilsProvider>
                <Grid container direction="row" className={classes.formItems}>
                    <FormControlLabel       
                        control={
                        <Switch
                            checked={useCycle} 
                            onChange={handleUseCycle}
                            name="checked cycle"
                            color="primary"
                        />
                        }
                        
                    />                    
                    <TextField
                        disabled={!useCycle}          
                        id="cycle-days"
                        label="Nº de dias embarcado"
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={cycleDays}
                        onChange={handleCycleDays}
                    />
                </Grid>
                <FormControl className={classes.formItems}>
                    <InputLabel id="repeat-cycle-label"
                    className={classes.formItems}>Repetir</InputLabel>
                    <Select
                        labelId="repeat-cycle-label"
                        id="repeat-cycle-select"
                        value={repeat}
                        onChange={handleRepeat}
                    >
                        <MenuItem value={0}>Não</MenuItem>
                        <MenuItem value={1}>1x</MenuItem>
                        <MenuItem value={2}>2x</MenuItem>
                        <MenuItem value={3}>3x</MenuItem>
                        <MenuItem value={4}>4x</MenuItem>
                        <MenuItem value={5}>5x</MenuItem>
                        <MenuItem value={6}>6x</MenuItem>
                        <MenuItem value={7}>7x</MenuItem>
                        <MenuItem value={8}>8x</MenuItem>
                        <MenuItem value={9}>9x</MenuItem>
                        <MenuItem value={10}>10x</MenuItem>
                        <MenuItem value={11}>11x</MenuItem>
                        <MenuItem value={12}>12x</MenuItem>
                    </Select>
                    <FormHelperText>Selecione por quantas vezes repetir a escala</FormHelperText>
                </FormControl>
            </Grid>
            <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
                        {shiftSuccess
                            ? <Alert severity="success">{successMsg}</Alert>
                            : <Alert severity="error" >{errorMsg}</Alert>
                        }
            </Snackbar>
        </Container>
    );
}