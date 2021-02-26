import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { Formik, Form, Field } from 'formik';
import * as Yup from "yup";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { TextField } from 'formik-material-ui';
import { useHistory, useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
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

  const [success, setSuccess] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState({
    title: "Ops...",
    message: "Um erro aconteceu! Contate-nos para mais informações!"
  })

  const send = async () => {
    
    await fetch("/api/user/resetPassword", {
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
  if (token === null) {
    history.push("/login");
  }
  
  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Typography variant="h4">Recuperação de senha</Typography>
        <Formik
          initialValues={{}}
          validationSchema={Yup.object({
            username: Yup.string()
              .required("Obrigatório"),
            password: Yup.string()
              .min(8, "Mínimo de 8 caracteres")
              .max(64, "Máximo de 64 caracteres")
              .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.!@$%#^&(){}\[\]:;<>,.?~+-/|/=/\\]).*$/, "Senha deve ter maiúsculas, minúsculas, números e caracteres especiais")
              .required("Obrigatório"),
            confirm: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Senha e confirmação não são iguais')
              .required("Obrigatório")
          })}
          onSubmit={async (values, { setSubmitting } ) => {
            setState(values);
            await send();
            setSubmitting(false);
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className={classes.form}>
              <Field
                fullWidth
                required
                margin="normal"
                variant="outlined"
                component={TextField}
                name="username"
                type="text"
                label="Nome de Usuário"
              />
              <Field
                fullWidth
                required
                margin="normal"
                variant="outlined"
                component={TextField}
                name="password"
                type="password"
                label="Senha"
              />
              <Field
                fullWidth
                required
                margin="normal"
                variant="outlined"
                component={TextField}
                name="confirm"
                type="password"
                label="Confirme sua senha"
              />
              { isSubmitting && <LinearProgress />}
              <Button
                className={classes.submit}
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                type="submit"
              >
                Enviar
              </Button>
            </Form>
          )}
        </Formik>
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
      </div>
    </Container>
    )
}