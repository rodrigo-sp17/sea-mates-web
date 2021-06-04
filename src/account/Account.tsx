import React, { useEffect, useState } from 'react';
import { Avatar, Button, Divider, Grid, LinearProgress, makeStyles, Snackbar, TextField, Typography } from "@material-ui/core";
import { useHistory } from 'react-router';
import DeleteAccountDialog from './DeleteAccountDialog';
import Alert from 'components/Alert';
import EditAccountDialog from './EditAccountDialog';
import User from 'data/user';

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

  const [user, setUser] = useState(new User());

  // Snack state
  const [snack, showSnack] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Sucesso!");
  const [errorMsg, setErrorMsg] = useState("");  

  // Changes parent title
  useEffect(() => {
    props.changeTitle('Minha Conta');
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || "";

    fetch("/api/user/me", {
      method: "GET",
      headers: {
        "Authorization": token,
      }
    }).then(
      (res) => {
        switch (res.status) {
          case 200:
            return res.json();
          case 403:
            history.push("/login");
            return;
          default:
            setSuccess(false);
            setErrorMsg("Não foi possível recuperar seus dados! Erro: " + res.status);
            showSnack(true);
        }
      },
      (error) => {
        setErrorMsg(error.message);
        setSuccess(false);
        showSnack(true);
      }
    )
    .then(
      (res) => {
        setUser({
          userId: res.userId,
          name: res.userInfo.name,
          username: res.userInfo.username,
          email: res.userInfo.email
        });
      },
      (error) => {
        setErrorMsg(error.message);
        setSuccess(false);
        showSnack(true);
      }
    );
    setIsLoaded(true);
  }, [isLoaded])

  const editAccount = async (newUser: User) => {
    if (newUser !== null) {
      setSubmitting(true);
      
      const token = sessionStorage.getItem("token") || "";      
      await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Authorization": token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.userId,
          name: newUser.name,
          email: newUser.email
        })
      })
      .then(
        (res) => {
          switch (res.status) {
            case 200:
              setSuccessMsg("Usuário editado com sucesso!");
              setSuccess(true);
              showSnack(true);              
              break;
            case 403:
              history.push("/login");
              break;
            case 409:
              setSuccess(false);
              setErrorMsg("O email já existe! Por favor, escolha outro!");
              showSnack(true);
              break
            default:
              setSuccess(false);
              setErrorMsg("Erro inesperado do servidor: " + res.status);
              showSnack(true);
          }
        },
        (error) => {
          setSuccess(false);
          setErrorMsg(error.message);
          showSnack(true);
        }
      );
      setSubmitting(false);
    }

    setIsLoaded(false);    
    setOpen({...open, editDialog: false})
  }
  
  const deleteAccount = async (password: string) => {
    if (password !== null || password !== "") {
      setDeleting(true);
      
      const token = sessionStorage.getItem("token") || "";      

      await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Authorization": token,
          "Password": password 
        }
      })
      .then(
        (res) => {
          switch (res.status) {
            case 204:
              setSuccess(true);
              setSuccessMsg("Conta deletada com sucesso!")
              showSnack(true);
              
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("loggedUsername");
              history.push("/login");
              break;
            case 403:
              history.push("/login");
              setSuccess(false);
              setErrorMsg("Deleção não autorizada");
              showSnack(true);
              break;
            default:
              setSuccess(false);
              setErrorMsg("Erro ao deletar: " + res.status);
              showSnack(true);
          }
        },
        (error) => {
          setSuccess(false);
          setErrorMsg(error.msg);
          showSnack(true);
        }
      )
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
          {user.username}
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
              value={user.name}
            />
          </Grid>
          <Grid container direction="row">
            <TextField
              fullWidth
              disabled
              variant="outlined"
              margin="normal"
              label="E-mail"
              value={user.email}
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
        <EditAccountDialog onClose={editAccount} open={open.editDialog} user={user}/>
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
            ? <Alert severity="success">{successMsg}</Alert>
            : <Alert severity="error" >{errorMsg}</Alert>
        }
      </Snackbar>
    </Grid>
  );
}