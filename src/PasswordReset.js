import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, TextField, Typography } from '@material-ui/core';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    maxWidth: 500,
    alignContent: 'center'
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  submit: {
    marginTop: theme.spacing(1)
  },
  footer: {
    marginTop: theme.spacing(2)
  }  
}))


export default function PasswordReset() {
  const classes = useStyles();  
  const location = useLocation();
  const history = useHistory();

  // Reads reset token from path
  const token = new URLSearchParams(location.search).get("reset");
  
  // Form state
  const [formState, setState] = useState({
    username: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState({
    title: "Ops...",
    message: "Um erro aconteceu! Contate-nos para mais informações!"
  })
  
  
  const handleChange = (event) => {
    setState({ ...formState, [event.target.name]: event.target.value});
  }

  const isValidPassword = (password) => {
    if (password.length < 8 || password.length > 64) {
      return false;
    } else {
      return true;
    }
  }

  const isValidUsername = (username) => {
    if (username.length === 0) return false;
    return true;
  }
  
  const validatePassword = () => {
    const password = formState.password;
    const confirm = formState.confirm;
    setErrors({...errors,
       password: !isValidPassword(password),
      confirm: confirm !== password});
  }
  
  const validateConfirm = () => {
    if (formState.confirm !== formState.password) {
      setErrors({...errors, confirm: true});
    } else {
      setErrors({...errors, confirm: false});
    }
  }

  const submit = () => {
    // Validating confirm
    if (errors.confirm 
      || errors.password 
      || !isValidPassword(formState.password) 
      || formState.password !== formState.confirm
      || !isValidUsername(formState.username)) {
      setDialog({
        title: "Oops...",
        message: "Por favor, preencha corretamente o formulário antes de enviar."
      });
      setOpen(true);
      return;
    }
    
    fetch("/api/user/resetPassword", {
      method: 'POST',
      headers: {
        "reset": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: formState.username,
        password: formState.password,
        confirmPassword: formState.confirm
      })
    })
    .then(
      (res) => {
        switch (res.status) {
          case 200:
            setDialog({
              title: "Sucesso!",
              message: "Sua senha foi redefinida. Por favor, efetue o login normalmente!"
            })
            setOpen(true);
            setSuccess(true);
            break;
          case 403:
            history.push("/login");
            break;
          case 400:
            setOpen(true);
            break;
          default:
            setDialog({
              ...dialog,
              message: "Algo deu errado em sua solicitação! Por favor, atualize a página e tente novamente!"
            })
            setOpen(true);
            break;
        }
      }, 
      (error) => {
        setDialog({
          ...dialog,
          message: "Algo deu errado em nosso servidor! Por favor, atualize a página e tente novamente!"
        })
        setOpen(true);
      }
    );
    
  }

  const closeDialog = () => {
    if (success) {
      history.push("/login");
    }
    setOpen(false);
  }


  // Redirects to login page if no token is provided
  if (token.length === 0) {
    history.push("/login");
  }
  
  return (
    <Container className={classes.paper}>
      <Grid container direction="column">
        <Grid item className={classes.header}>
          <Typography variant="h5">Recuperação de senha</Typography>
        </Grid>
        <Grid item>
          <TextField
            error={errors.username}
            type="text"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="username"
            label="Nome de usuário"
            value={formState.username}
            onChange={handleChange}
          />
          <TextField
            error={errors.password}
            type="password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nova senha"
            helperText="Senhas devem ter entre 8 e 64 caracteres, conter letras maíusculas, minúsculas, números e um caractere especial"
            value={formState.password}
            onChange={handleChange}
            onBlur={validatePassword}
          />
          <TextField
            error={errors.confirm}
            type="password" 
            helperText={errors.confirm ? "Senha e confirmação não são iguais!" : ""}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirm"
            label="Confirme a nova senha"
            value={formState.confirm}
            onChange={handleChange}
            onBlur={validateConfirm}
          />
          <Button className={classes.submit} variant="contained" color="primary" onClick={submit}>Enviar</Button>
        </Grid>
        <Grid item className={classes.footer}>

        </Grid>
      </Grid>
      <Dialog open={open} fullWidth>
        <DialogTitle>
          {dialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>OK</Button>
        </DialogActions>
      </Dialog>
    </Container>
    )
}