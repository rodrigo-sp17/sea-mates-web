import React, { useEffect, useState } from 'react';
import { Avatar, Button, Container, Divider, Grid, LinearProgress, makeStyles, Snackbar, TextField, Typography } from "@material-ui/core";
import { useHistory } from 'react-router';
import DeleteAccountDialog from './DeleteAccountDialog';
import Alert from 'view/components/Alert';
import EditAccountDialog from './EditAccountDialog';
import User from 'api/data/user';
import { userState, useUserModel } from 'api/model/user_model';
import { useRecoilValue } from 'recoil';

const useStyles = makeStyles(theme => ({
  paper: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1000
  },
  header: {
    alignSelf: 'center'
  },
  logo: {
    marginBottom: theme.spacing(3)
  },
  editButton: {
    marginTop: theme.spacing(3)
  },
  deleteButton: {
    backgroundColor: "red",
    color: "white",
    marginTop: theme.spacing(2)
  }
}))


export default function Account(props: any) {
  const { changeTitle } = props;
  const classes = useStyles();
  const history = useHistory();

  const [isSubmitting, setSubmitting] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const [open, setOpen] = useState({
    editDialog: false,
    deleteDialog: false,
  });

  const originalUser = useRecoilValue(userState);
  const { editUser, deleteUser } = useUserModel();

  // Snack state
  const [snack, showSnack] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Changes parent title
  useEffect(() => {
    changeTitle('Minha Conta');
  }, [changeTitle]);

  const editAccount = async (newValues: any) => {
    if (newValues !== null) {
      setSubmitting(true);
      var newUser = new User();
      newUser.userId = originalUser.userId;
      newUser.name = newValues.name;
      // Required since the server expects null where no editions are required      
      const newEmail = newValues.email;
      newUser.email = newEmail === originalUser.email ? null : newEmail;

      var errorMsg = await editUser(newUser);
      if (errorMsg) {
        setMessage(errorMsg);
        setSuccess(false);
      } else {
        setMessage("Usuário editado com sucesso!");
        setSuccess(true);
      }
      showSnack(true);
    }
    setSubmitting(false);
    setOpen({ ...open, editDialog: false });
  }

  const deleteAccount = async (password: string) => {
    if (password !== null || password !== "") {
      setDeleting(true);

      var errorMsg = await deleteUser(originalUser, password);
      if (errorMsg) {
        setMessage(errorMsg);
        setSuccess(false);
      } else {
        setMessage("Conta deletada com sucesso!");
        setSuccess(true);
        history.push('/login');
      }
      showSnack(true);
    }

    setDeleting(false);
    setOpen({ ...open, deleteDialog: false });
  };

  const openDeleteDialog = () => {
    setOpen({ ...open, deleteDialog: true })
  }

  const openEditDialog = () => {
    setOpen({ ...open, editDialog: true })
  }

  return (
    <Container className={classes.paper} disableGutters>
      <Grid container item direction="column" alignItems="center">
        <Avatar className={classes.logo} />
        <Typography variant="h6">
          {originalUser.username}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="subtitle1">
          Meus dados
        </Typography>
        <Divider />
        <Grid direction="column" container item>
          <Grid container direction="row">
            <TextField
              fullWidth
              disabled
              variant="outlined"
              margin="normal"
              label="Nome"
              value={originalUser.name}
            />
          </Grid>
          <Grid container direction="row">
            <TextField
              fullWidth
              disabled
              variant="outlined"
              margin="normal"
              label="E-mail"
              value={originalUser.email}
            />
          </Grid>
        </Grid>
        {isSubmitting && <LinearProgress />}
        <Button
          disabled={isSubmitting}
          fullWidth
          className={classes.editButton}
          onClick={openEditDialog}
          variant="contained"
          color="primary"
        >
          Editar Dados
        </Button>
        <EditAccountDialog onClose={editAccount} open={open.editDialog} user={originalUser} />
      </Grid>
      <Grid item>
        <Divider />
        {isDeleting && <LinearProgress />}
        <Button
          disabled={isDeleting}
          fullWidth
          className={classes.deleteButton}
          variant="contained"
          color="secondary"
          onClick={openDeleteDialog}
        >
          Apagar Conta
        </Button>
        <DeleteAccountDialog onClose={deleteAccount} open={open.deleteDialog} />
      </Grid>
      <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
        {success
          ? <Alert severity="success">{message}</Alert>
          : <Alert severity="error" >{message}</Alert>
        }
      </Snackbar>
    </Container>
  );
}