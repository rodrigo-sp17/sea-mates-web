import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField } from "@material-ui/core";

export default function DeleteAccountDialog(props) {
  const { onClose, open } = props;
  const [password, setPassword] = useState("");

  const submit = () => {
    onClose(password);
  }

  const cancel = () => {
    onClose("");
  }

  const handleChange = (event) => {
    setPassword(event.target.value);
  }

  return (
    <Grid container>
      <Dialog open={open}>
        <DialogTitle>Tem certeza que deseja deletar sua conta?</DialogTitle>
        <DialogContent>
          <DialogContentText>Esta ação é permanente. Para confimar, digite sua senha abaixo:</DialogContentText>
          <TextField
            fullWidth
            type="password"
            label="Senha"
            value={password}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={cancel}>Cancelar</Button>
          <Button onClick={submit}>Deletar</Button>
        </DialogActions>
      </Dialog>      
    </Grid>
  );
}

DeleteAccountDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};