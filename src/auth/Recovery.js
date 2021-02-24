import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, makeStyles, TextField, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    maxWidth: 500,
    alignContent: 'center'
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  submit: {
    marginTop: theme.spacing(1)
  },
  footer: {
    marginTop: theme.spacing(2)
  }

}))

export default function Recovery() {
  const classes = useStyles();
  const history = useHistory();
  const [input, setInput] = useState(null);

  // Dialog state
  const [open, setOpen] = useState(false);
  
  const successMsg = "Um e-mail com instruções para troca de senha foi enviado para o e-mail de recuperação de sua conta." +
   " Por favor, cheque sua caixa de e-mail e siga o link fornecido para continuar o procedimento.";
  
  const errorMsg = "Não foi possível enviar a recuperação! Por favor, recarregue a página e tente novamente";
  
  const [dialog, setDialog] = useState({
    title: "Ops...",
    message: errorMsg
  })

  // Handlers
  const redirectLogin = () => {
    history.push('/login');
  }

  const handleChange = (event) => {
    setInput(event.target.value);
  }

  const submit = () => {
    fetch("/api/user/recover?user=" + input, {
      method: 'POST'
    })
    .then(
      (res) => {
        if (res.ok) {
          setDialog({
            title: "Recuperação em andamento!",
            message: successMsg
          })
        }
      }, 
      (error) => {
      }
    )

    setOpen(true);
  }

  const closeDialog = () => {
    setOpen(false);
  }

  return (
    <Container className={classes.paper}>
      <Grid container direction="column">
        <Grid item xs className={classes.header}>
          <Typography  variant="h5">
            Recuperação de conta
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            Digite seu e-mail ou nome de usuário para recuperação de conta:
          </Typography>
          <TextField 
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="forgot-input"
            label="Nome de usuário ou endereço de e-mail para recuperação"
            name="usernameOrEmail"
            autoComplete="email"
            autoFocus
            value={input}
            onChange={handleChange}
          />
          <Button className={classes.submit} variant="contained" color="primary" onClick={submit} fullWidth>
            Enviar 
          </Button>
        </Grid>
        <Grid item xs className={classes.footer}>
          <Link href="#" variant="body2" onClick={redirectLogin}>
            Retornar para Login
          </Link>
        </Grid>
        <Dialog open={open} fullWidth>
          <DialogTitle>{dialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {dialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>OK</Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Container>

  )
}