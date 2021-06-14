import React, { useEffect, useState } from 'react';
import Alert from 'view/components/Alert';
import { Snackbar, Checkbox, Fab, Grid, List, ListItem, ListItemIcon, ListItemText, Container, makeStyles } from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Shift from 'api/data/shift';
import { checkedShiftState, shiftListState, useShiftModel } from 'api/model/shift_model';
import { useRecoilState, useRecoilValue } from 'recoil';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 1200,
  },
  fab: {
    position: 'fixed',
    left: 'auto',
    right: 20,
    bottom: 20,
    zIndex: 100
  }
}));

export default function Shifts(props: any) {
  const { changeTitle } = props;
  const classes = useStyles();
  const { reloadShifts, deleteShift } = useShiftModel();

  // Shift selection state (through checkbox)
  const [isDeleting, setDeleting] = useState(false);
  const shifts = useRecoilValue(shiftListState);
  const [checked, setChecked] = useRecoilState(checkedShiftState);
  const [showDeleteFab, setShowDeleteFab] = useState(false);

  // Snack state
  const [snack, showSnack] = useState(false);
  const [shiftSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Changes parent title
  useEffect(() => {
    changeTitle("Escalas");
  }, [changeTitle])

  useEffect(() => {
    reloadShifts();
  }, []);

  const deleteShifts = async () => {
    if (isDeleting) return;
    setDeleting(true);

    var deleted = 0;
    var successful = true;

    for (let id of checked) {
      let errorMsg = await deleteShift(id);
      if (errorMsg) {
        setMessage(errorMsg);
        successful = false;
        return;
      } else {
        deleted++;
      }
    }

    if (successful) {
      setSuccess(true);
      setMessage(`Deletadas ${deleted} escalas!`);
      setShowDeleteFab(false);
      setChecked(new Set());
    } else {
      setSuccess(false);
    }
    setDeleting(false);
    showSnack(true);
  };


  // Handles the toggling of list items
  const handleToggle = (shiftId: number) => () => {
    const isSelected = checked.has(shiftId);
    const oldChecked = new Set(checked);
    if (isSelected) {
      oldChecked.delete(shiftId);
    } else {
      oldChecked.add(shiftId);
    }
    setChecked(oldChecked);

    if (oldChecked.size === 0) {
      setShowDeleteFab(false);
    } else {
      if (!showDeleteFab) {
        setShowDeleteFab(true);
      }
    }
  };

  return (
    <Container disableGutters className={classes.root}>
      <List disablePadding>
        {shifts.map((shift: Shift) => (
          <ListItem
            divider
            key={shift.shiftId}
            button
            onClick={handleToggle(shift.shiftId)}
            selected={checked.has(shift.shiftId)}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.has(shift.shiftId)}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={`${shift.unavailabilityStartDate.toLocaleDateString("pt-br")} --> ${shift.unavailabilityEndDate.toLocaleDateString("pt-br")}`}
            />
          </ListItem>
        ))}
      </List>
      <Grid container justify="flex-end" className={classes.fab}>
        {showDeleteFab
          ? <Fab color="secondary" aria-label="delete" onClick={deleteShifts} children={<Delete />} />
          : <Fab color="primary" aria-label="add" component={Link} to="/shift" children={<Add />} />
        }
      </Grid>
      <Grid>
        <Snackbar open={snack} autoHideDuration={2000} onClose={() => showSnack(false)} >
          {shiftSuccess
            ? <Alert severity="success">{message}</Alert>
            : <Alert severity="error" >{message}</Alert>
          }
        </Snackbar>
      </Grid>
    </Container>
  );
}