import React, { useEffect, useState } from 'react';
import Alert from 'components/Alert';
import { Snackbar, Checkbox, Fab, Grid, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Typography, Hidden } from '@material-ui/core';
import { Add, Delete, Edit } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Shift from 'data/shift';
import { checkedShiftState, shiftListState, useShiftModel } from 'model/shift_model';
import { useRecoilState, useRecoilValue } from 'recoil';


export default function Shifts(props: any) {
  const { deleteShift } = useShiftModel();
  
  // Shift selection state (through checkbox)
  const shifts = useRecoilValue(shiftListState);
  const [checked, setChecked] = useRecoilState(checkedShiftState);
  const [showDeleteFab, setShowDeleteFab] = useState(false);
  
  // Snack state
  const [snack, showSnack] = useState(false);
  const [shiftSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Changes parent title
  useEffect(() => {
      props.changeTitle("Escalas");
  }, [])
  
  
  const deleteShifts = () => {
    var deleted = 0;
    var successful = true;

    checked.forEach(async (id) => {
      let errorMsg = await deleteShift(id);
      if (errorMsg) {
        setMessage(errorMsg);
        successful = false;
        return;
      } else {
        deleted++;
      }
    });

    if (successful) {
      setSuccess(true);
      setMessage(`Deletadas ${deleted} escalas!`);
    } else {
      setSuccess(false);
    }
    showSnack(true);
  };


  // Handles the toggling of list items
  const handleToggle = (shiftId: number) => () => {
    const isSelected = checked.has(shiftId);
    const oldChecked = checked;
    if (isSelected) {
      oldChecked.delete(shiftId);
    } else {
      oldChecked.add(shiftId);
    }
    setChecked(oldChecked);

    if (oldChecked.size == 0) {
      setShowDeleteFab(false);
    } else {
      if (!showDeleteFab) {
        setShowDeleteFab(true);
      }
    }
  };

  return (
    <Grid container direction="column" alignItems="stretch">
      <Grid container justify="center">
        <List>
          {shifts.map((shift: Shift) => (
            <ListItem 
              key={shift.shiftId} 
              button 
              onClick={handleToggle(shift.shiftId)}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checked.has(shift.shiftId)}
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
                primary={`De ${shift.unavailabilityStartDate} até ${shift.unavailabilityEndDate}`}
              />                        
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid container justify="flex-end">
        {showDeleteFab 
        ? <Fab color="secondary" aria-label="delete" onClick={deleteShifts} children={<Delete />}/>
        : <Fab color="primary" aria-label="add" component={Link} to="/shift" children={<Add />} />            
        }
      </Grid>
      <Grid>
        <Snackbar open={snack} autoHideDuration={4000} onClose={() => showSnack(false)} >
          {shiftSuccess
            ? <Alert severity="success">{message}</Alert>
            : <Alert severity="error" >{message}</Alert>
          }
        </Snackbar>
      </Grid>
    </Grid>
  );
}