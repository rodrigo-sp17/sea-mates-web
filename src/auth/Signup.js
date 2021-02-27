import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Alert from '../components/Alert';
import { Link, useHistory } from 'react-router-dom';
import { Avatar, Button, Grid, LinearProgress, makeStyles, Snackbar, Typography } from '@material-ui/core';
import { TextField as MuiTextField } from 'formik-material-ui';
import { Formik, Form, Field } from 'formik';
import * as Yup from "yup";
import logo from 'logo.svg';


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
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logo: {
    width: theme.spacing(14),
    height: theme.spacing(14),
    margin: theme.spacing(1)
  }
}));


export default function Signup() {    
    const classes = useStyles();
    const history = useHistory();
    
    // Dialog state
    const[message, setMessage] = useState("Erro crítico!");
    const[signupSuccess, setSuccess] = useState(false);
    const[snack, showSnack] = useState(false);

    const redirectLogin = () => {
      history.push("/login");
    }
    
    const sendSignup =  async (values) => {
        const url = "/api/user/signup";
        const options = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },    
            body: JSON.stringify({
                name: values.name,
                email: values.email,                
                username: values.username,
                password: values.password,
                confirmPassword: values.confirmPassword
            })
        };
        
        await fetch(url, options)
        .then(
          (res) => {
            switch (res.status) {
              case 201:
                setSuccess(true);
                setMessage("Usuário criado com sucesso! Redirecionando para login...")
                showSnack(true);
                setTimeout(() => { history.push('/login'); }, 2000);
                break;
              case 400:
                setSuccess(false);
                setMessage("Dados da solicitação estão incorretos! Por favor, verifique-os e tente novamente!")
                showSnack(true);
                break;
              case 409:
                setSuccess(false);
                setMessage("O usuário já existe! Por favor, escolha outro!");
                showSnack(true);
                break;
              case 500:
                setSuccess(false);
                setMessage("Erro inesperado do servidor! - 500");
                showSnack(true);
                break;
              default:
                setSuccess(false);
                setMessage("Erro inesperado: " + res.status);
                showSnack(true);
            }
          },
          (error) => {
            setSuccess(false);
            setMessage(error.message);
          }                             
        );
    };
     
  return(
      <Container component="main" maxWidth="xs">
          <div className={classes.paper}>
              <Avatar 
                className={classes.logo}
                src={logo}
              />
              <Typography variant="h4">
                  Cadastrar novo usuário
              </Typography>
              <Formik
                initialValues={{}}
                validationSchema={Yup.object({
                  name: Yup.string()
                    .max(60, "Deve ter 60 caracteres ou menos")
                    .matches(/^[a-zA-Z]+\s[a-zA-Z]+$/, "Nome inválido")
                    .required("Obrigatório"),
                  username: Yup.string()
                    .min(6, "Mínimo de 6 letras")
                    .max(30, "Máximo de 30 letras")
                    .required("Obrigatório"),
                  email: Yup.string()
                    .email("E-mail inválido")
                    .required("Obrigatório"),
                  password: Yup.string()
                    .min(8, "Mínimo de 8 caracteres")
                    .max(64, "Máximo de 64 caracteres")
                    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.!@$%#^&(){}\[\]:;<>,.?~+-/|/=/\\]).*$/, "Senha deve ter maiúsculas, minúsculas, números e caracteres especiais")
                    .required("Obrigatório"),
                  confirmPassword: Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Senha e confirmação não são iguais')
                    .required("Obrigatório")
                })}
                onSubmit={async (values, { setSubmitting } ) => {
                  await sendSignup(values);
                  setSubmitting(false);       
                }}   
              >
                {({ submitForm, isSubmitting}) => (
                  <Form className={classes.form}>
                    <Field
                      autoFocus
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      component={MuiTextField}
                      name="name"
                      type="text"
                      label="Nome e Sobrenome"
                    />
                    <Field
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      component={MuiTextField}
                      name="email"
                      type="email"
                      label="Endereço de e-mail"
                    />
                    <Field
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      component={MuiTextField}
                      name="username"
                      type="text"
                      label="Nome de Usuário"
                    />
                    <Field
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      component={MuiTextField}
                      name="password"
                      type="password"
                      label="Senha"
                    />
                    <Field
                      fullWidth
                      required
                      margin="normal"
                      variant="outlined"
                      component={MuiTextField}
                      name="confirmPassword"
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
                      Cadastrar
                    </Button>
                  </Form>
                )}
              </Formik>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={redirectLogin}>
                    Voltar para Login
                  </Link>
                </Grid>
              </Grid>
              <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
                      {signupSuccess
                          ? <Alert severity="success">{message}</Alert>
                          : <Alert severity="error" >{message}</Alert>
                      }
              </Snackbar>
          </div>            
      </Container>
  );
}

