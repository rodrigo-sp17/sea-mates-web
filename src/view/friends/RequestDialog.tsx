import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from '@material-ui/core';

interface Props {
  open: boolean,
  onClose: (username: string | null) => void
}

export default function RequestDialog(props: Props) {
  const { onClose, open } = props;
  const [username, setUsername] = useState("");

  const submit = () => {
    onClose(username);
  }

  const cancel = () => {
    onClose("");
  }

  const handleChange = (event: any) => {
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
          <Button color="primary" onClick={cancel}>Cancelar</Button>
          <Button color="primary" onClick={submit}>Requisitar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
