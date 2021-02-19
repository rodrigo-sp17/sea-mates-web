import { React, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from '@material-ui/core';

export default function RequestDialog(props) {
  const { onClose, open } = props;
  const [username, setUsername] = useState("");
  
  const submit = (name) => (event) => {
    onClose(name);
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
            fullWidth
            onChange={(event) => setUsername(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={submit(username)}>Requisitar</Button>
          <Button color="primary" onClick={submit("")}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

RequestDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};