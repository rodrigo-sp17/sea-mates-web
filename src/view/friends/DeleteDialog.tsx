import { Dialog, DialogTitle, DialogActions, Button } from "@material-ui/core";
import Friend from "api/data/friend";
import React from "react";

interface Props {
  open: boolean,
  onClose: (username: string | null) => void,
  friend: Friend
}

export default function DeleteDialog(props: Props) {
  const { open, onClose, friend } = props;

  const handleClose = () => {
    onClose(null);
  }

  const handleConfirm = () => {
    onClose(friend.username);
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {`Deseja desfazer a amizade com ${friend.username}?`}
      </DialogTitle>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Cancelar
      </Button>
        <Button autoFocus color="primary" onClick={handleConfirm}>
          Aceitar
      </Button>
      </DialogActions>
    </Dialog>
  );
}