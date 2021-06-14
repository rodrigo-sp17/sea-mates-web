import React, { ChangeEvent, forwardRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Alert from '../components/Alert';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { Snackbar, Button, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText, TextField, FormControlLabel, Switch, Dialog, Slide, CircularProgress } from '@material-ui/core';
import { Close, Save } from '@material-ui/icons';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import addDays from 'date-fns/addDays';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import { useShiftModel } from 'api/model/shift_model';
import Shift from 'api/data/shift';
import { TransitionProps } from '@material-ui/core/transitions';
import { isAfter, isBefore } from 'date-fns';

// Styling
const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  form: {
    marginTop: theme.spacing(1),
  },
  formItems: {
    padding: theme.spacing(1),
  },
}));


const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function ShiftDialog(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const { addShift } = useShiftModel();
  const [open, setOpen] = useState(true);

  // Snack state
  const [snack, showSnack] = useState(false);
  const [message, setMessage] = useState('');
  const [shiftSuccess, setSuccess] = useState(false);

  // Shift state
  const [shift, setShift] = useState(new Shift());
  const [useCycle, setUseCycle] = useState(false);
  const [errors, setErrors] = useState<any>({
    dateUnavailable: null,
    dateBoarding: null,
    dateLeaving: null,
    dateAvailable: null
  });
  const [isSubmitting, setSubmitting] = useState(false);

  // Handlers
  const handleUnavailableDate = (date: Date | null) => {
    if (date == null) return;
    setShift({ ...shift, unavailabilityStartDate: date });
  }

  const handleBoardingDate = (date: Date | null) => {
    if (date == null) return;

    var newUnStartDate = shift.unavailabilityStartDate;
    if (isBefore(date, newUnStartDate)) {
      newUnStartDate = date;
    }

    var newCycleDays = shift.cycleDays;
    if (!useCycle) {
      newCycleDays = differenceInCalendarDays(shift.leavingDate, date);
    }
    setShift({ ...shift, unavailabilityStartDate: newUnStartDate, boardingDate: date, cycleDays: newCycleDays });
  }

  const handleLeavingDate = (date: Date | null) => {
    if (date == null) return;

    var newUnEndDate = shift.unavailabilityEndDate;
    if (isAfter(date, newUnEndDate)) {
      newUnEndDate = date;
    }

    var newCycleDays = shift.cycleDays;
    if (!useCycle) {
      newCycleDays = differenceInCalendarDays(date, shift.boardingDate);
    }
    setShift({ ...shift, unavailabilityEndDate: newUnEndDate, leavingDate: date, cycleDays: newCycleDays });
  }

  const handleAvailableDate = (date: Date | null) => {
    if (date == null) return;
    setShift({ ...shift, unavailabilityEndDate: date });
  }

  const handleUseCycle = (event: ChangeEvent<any>) => {
    let checked = event.target.checked;
    setUseCycle(checked);
  }

  const handleRepeat = (event: ChangeEvent<{ value: unknown }>) => {
    var times = event.target.value as number;
    setShift({ ...shift, repeat: times });
  }

  const handleCycleDays = (event: ChangeEvent<HTMLInputElement>) => {
    if (useCycle) {
      let days = parseInt(event.target.value);
      if (days < 0) days = 0;

      const newLeavingDate = calculateCycle(days);
      setShift({
        ...shift,
        cycleDays: days,
        leavingDate: newLeavingDate,
        unavailabilityEndDate: newLeavingDate
      });
    }
  }

  const calculateCycle = (cycleValue: number): Date => {
    const result = addDays(shift.boardingDate, cycleValue);
    return result;
  }

  const submit = async (event: any) => {
    event.preventDefault();
    if (isSubmitting) return;
    
    if (validate()) {
      setSubmitting(true);
      let errorMsg = await addShift(shift);
      if (errorMsg) {
        setMessage(errorMsg);
        setSuccess(false);
      } else {
        setMessage("Escala(s) salvas!");
        setSuccess(true);
      }
      showSnack(true);
      setSubmitting(false);
    }
  };

  const validate = (): boolean => {
    setErrors({
      dateUnavailable: null,
      dateBoarding: validateBoardingDate(),
      dateLeaving: validateLeavingDate(),
      dateAvailable: validateAvailableDate()
    });

    for (let key in errors) {
      if (errors[key] != null) {
        return false;
      }
    }
    return true;
  }

  const validateBoardingDate = (): string | null => {
    return isAfter(shift.unavailabilityStartDate, shift.boardingDate)
      ? "Data de embarque deve ser após a indisponibilidade"
      : null;
  }

  const validateLeavingDate = (): string | null => {
    return isBefore(shift.leavingDate, shift.boardingDate)
      ? "Data de desembarque deve ser após a data de embarque"
      : null;
  }
  const validateAvailableDate = (): string | null => {
    return isBefore(shift.unavailabilityEndDate, shift.leavingDate)
      ? "Data de disponibilidade deve ser aṕos desembarque"
      : null;
  }

  const closeSnack = () => {
    showSnack(false);
    if (shiftSuccess) {
      history.goBack();
    }
  }

  const handleClose = () => {
    setOpen(false);
    history.goBack();
  }

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar position="relative">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="close" onClick={handleClose}>
            <Close />
          </IconButton>
          <Typography variant="h6" className={classes.title} >
            Adicionar Escala
          </Typography>
          {isSubmitting ? <CircularProgress /> :
          <Button color="inherit" startIcon={<Save />} onClick={submit}>
            Salvar
          </Button>}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className={classes.form} >
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.formItems}
            margin="normal"
            id="date-unavailable"
            label="Indisponível a partir de"
            format="dd/MM/yyyy"
            error={Boolean(errors.dateUnavailable)}
            helperText={errors.dateUnavailable}
            value={shift.unavailabilityStartDate}
            onChange={handleUnavailableDate}
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
            error={Boolean(errors.dateBoarding)}
            helperText={errors.dateBoarding}
            value={shift.boardingDate}
            onChange={handleBoardingDate}
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
            error={Boolean(errors.dateLeaving)}
            helperText={errors.dateLeaving}
            value={shift.leavingDate}
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
            error={Boolean(errors.dateAvailable)}
            helperText={errors.dateAvailable}
            value={shift.unavailabilityEndDate}
            onChange={handleAvailableDate}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
        </MuiPickersUtilsProvider>
        <Grid container direction="row" className={classes.formItems}>
          <FormControlLabel
            label=""
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
            value={shift.cycleDays}
            onChange={handleCycleDays}
          />
        </Grid>
        <FormControl className={classes.formItems}>
          <InputLabel id="repeat-cycle-label"
            className={classes.formItems}>Repetir</InputLabel>
          <Select
            labelId="repeat-cycle-label"
            id="repeat-cycle-select"
            value={shift.repeat}
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
      </Container>
      <Snackbar open={snack} autoHideDuration={1000} onClose={closeSnack} >
        {shiftSuccess
          ? <Alert severity="success">{message}</Alert>
          : <Alert severity="error" >{message}</Alert>
        }
      </Snackbar>
    </Dialog>
  );
}