import { React, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from '@material-ui/core';

export default function RequestDialog(props) {
  const { onClose, open } = props;
  const [username, setUsername] = useState("");
  
  const submit = (event) => {
    onClose(username);
  }

  const cancel = () => {
    onClose("");
  }

  const handleChange = (event) => {
    setUsername(event.target.value);
  }

  return (
    <Grid container>
      <Dialog open={open}>
        <DialogTitle>Requisitar amizade</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Digite abaixo o nome de usuário que deseja adicionar como amigo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Nome de usuário"
            type="text"
            value={username}
            fullWidth
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={submit}>Requisitar</Button>
          <Button color="primary" onClick={cancel}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

RequestDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};