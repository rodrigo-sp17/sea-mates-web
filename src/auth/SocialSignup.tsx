import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Alert from '../components/Alert';
import { useHistory, useLocation } from 'react-router-dom';
import { Avatar, Button, Grid, LinearProgress, Link, makeStyles, Snackbar, Typography } from '@material-ui/core';
import { TextField as MuiTextField } from 'formik-material-ui';
import { Formik, Form, Field } from 'formik';
import * as Yup from "yup";
import logo from 'logo.svg';
import { useSocialSignup } from 'model/user_model';
import SocialUser from 'data/social_user';


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


export default function SocialSignup() {    
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const socialSignup = useSocialSignup();

  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const email = params.get('email');
  const socialId = params.get('socialId');
  const registrationId = params.get('registrationId');
  
  // Dialog state
  const[message, setMessage] = useState("Erro crítico!");
  const[signupSuccess, setSuccess] = useState(false);
  const[snack, showSnack] = useState(false);

  const redirectLogin = () => history.push("/login");
    
  const sendSignup =  async (values: any) => {
    var socialUser: SocialUser = {...values,
      socialId: socialId,
      registrationId: registrationId
    };

    var errorMsg = await socialSignup(socialUser);
    if (errorMsg) {
      setSuccess(false);
      setMessage(errorMsg);
    } else {
      setSuccess(true);
      setMessage("Usuário criado com sucesso! Redirecionando...");
    }

    showSnack(true);
    if (signupSuccess) setTimeout(() => redirectLogin(), 2000);
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
          initialValues={{
            name: name,
            email: email,
          }}
          validationSchema={Yup.object({
            name: Yup.string()
              .max(60, "Deve ter 60 caracteres ou menos")
              .matches(/^([^0-9{}\\/()\]\[]*)$/, "Nome inválido")
              .required("Obrigatório"),
            username: Yup.string()
              .min(6, "Mínimo de 6 letras")
              .max(30, "Máximo de 30 letras")
              .required("Obrigatório"),
            email: Yup.string()
              .email("E-mail inválido")
              .required("Obrigatório"),
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

