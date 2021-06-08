import React, { useEffect, useState } from 'react';
import { Avatar, Button, Divider, Grid, LinearProgress, makeStyles, Snackbar, TextField, Typography } from "@material-ui/core";
import { useHistory } from 'react-router';
import DeleteAccountDialog from './DeleteAccountDialog';
import Alert from 'components/Alert';
import EditAccountDialog from './EditAccountDialog';
import User from 'data/user';
import { useDeleteUser, useEditUser, useReloadUser, userState } from 'model/user_model';
import { useRecoilValue } from 'recoil';

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
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
  const classes = useStyles();
  const history = useHistory();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const [open, setOpen] = useState({
    editDialog: false,
    deleteDialog: false,
  });

  const originalUser = useRecoilValue(userState);
  const [localUser, setLocalUser] = useState(new User());
  const editUser = useEditUser();
  const deleteUser = useDeleteUser();
  const reloadUser = useReloadUser();

  // Snack state
  const [snack, showSnack] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Changes parent title
  useEffect(() => {
    props.changeTitle('Minha Conta');
  }, []);

  useEffect(() => {
    if (isLoaded == false) {
      loadUser();
    } else {
      if (originalUser !== null) {
        setLocalUser(originalUser);
      }
    }
  }, [isLoaded]);

  const loadUser = async () => {
    await reloadUser();
    setIsLoaded(true);
  }

  const editAccount = async (newUser: User) => {
    if (newUser !== null) {
      setSubmitting(true);

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

    setIsLoaded(false);    
    setOpen({...open, editDialog: false});
  }
  
  const deleteAccount = async (password: string) => {
    if (password !== null || password !== "") {
      setDeleting(true);
      
      var errorMsg = await deleteUser(localUser, password);
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
    setOpen({...open, deleteDialog: true})
  }

  const openEditDialog = () => {
    setOpen({...open, editDialog: true})
  }

  return (
    <Grid container spacing={3} direction="column" alignItems="stretch">
      <Grid container item direction="column" alignItems="center">
        <Avatar className={classes.logo}/>
        <Typography variant="h6">
          {localUser.username}
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
              value={localUser.name}
            />
          </Grid>
          <Grid container direction="row">
            <TextField
              fullWidth
              disabled
              variant="outlined"
              margin="normal"
              label="E-mail"
              value={localUser.email}
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
        <EditAccountDialog onClose={editAccount} open={open.editDialog} user={localUser}/>
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
        <DeleteAccountDialog onClose={deleteAccount} open={open.deleteDialog}/>
      </Grid>
      <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
          {success
            ? <Alert severity="success">{message}</Alert>
            : <Alert severity="error" >{message}</Alert>
        }
      </Snackbar>
    </Grid>
  );
}