import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Alert from 'components/Alert'
import { Avatar, Button, Divider, LinearProgress, Link, makeStyles, Snackbar, TextField, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import logo from 'logo.svg';
import { Facebook, Instagram } from '@material-ui/icons';
import { blue } from '@material-ui/core/colors';
import jwt_decode from "jwt-decode";


const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    social: {
      marginBottom: theme.spacing(6),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    logo: {
        width: theme.spacing(14),
        height: theme.spacing(14),
        margin: theme.spacing(1)
    },
    fb_button: {
      marginTop: theme.spacing(2),
      color: 'white',
      backgroundColor: blue[900],
      textTransform: 'none',
      fontSize: 18
    },
    ig_button: {
      marginTop: theme.spacing(2),
      color: 'white',
      textTransform: 'none',
      backgroundColor: 'purple',
      fontSize: 18
    }
}));

export default function Login() {    
    const classes = useStyles();
    const history = useHistory();

    const [state, setState] = useState({
      username: "",
      password: ""
    })
    const [isSubmitting, setSubmitting] = useState(false);

    // Snack state
    const successMsg = "Login com sucesso!";
    const [errorMsg, setErrorMsg] = useState("");
    const [loginSuccess, setSuccess] = useState(false);
    const [snack, showSnack] = useState(false);

    const redirectSignup = () => {
        history.push('/signup');
    }

    const redirectRecovery =() => {
        history.push('/recovery');
    }

    const sendLogin = async () => {
        const url = "/login";
        const options = {
            method: 'POST',
            mode: 'no-cors',              
            body: JSON.stringify({
                username: state.username,
                password: state.password
            })
        };

        await fetch(url, options)
        .then(
            (res) => {
              switch (res.status) {
                case 200:
                  let token = res.headers.get("Authorization").replace("Bearer ", "");
                  let username = jwt_decode(token).sub;
                  sessionStorage.setItem("token", res.headers.get("Authorization"));
                  sessionStorage.setItem("loggedUsername", username);
                  setSuccess(true);
                  showSnack(true);
                  setTimeout(() => {
                    history.push("/home");
                  }, 500);
                  break;
                case 403:
                  setSuccess(false);
                  setErrorMsg("Usuário ou senha incorretos!");
                  showSnack(true);
                  break;
                case 401:
                  setSuccess(false);
                  setErrorMsg("Usuário ou senha incorretos!");
                  showSnack(true);
                  break;
                case 500:
                  setSuccess(false);
                  setErrorMsg("Algo deu errado em nosso servidor!");
                  showSnack(true);
                  break;
                default:
                  setSuccess(false);
                  setErrorMsg("Erro inesperado do servidor: " + res.status);
                  showSnack(true);
              }
            },
            (error) => {
              setErrorMsg(error);
              showSnack(true);
            }
        )            
    };

    const handleChange = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setState({
        ...state,
        [name]: value
      });
    }
      
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        await sendLogin();
        setSubmitting(false);
    };
    
    if (sessionStorage.getItem('token') !== null) {
      history.push("/home");
    }
    
    return(
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar
                    className={classes.logo}
                    src={logo}
                />
                <Typography align='center' variant="h4">
                    SeaMates - Agenda Marítima
                </Typography>
                <form onSubmit={handleSubmit} className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Nome de Usuário ou Email"
                        name="username"
                        autoFocus
                        autoComplete="email"
                        value={state.username}
                        onChange={handleChange}
                    />
                    <TextField 
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Senha"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={state.password}
                        onChange={handleChange}
                    />
                    { isSubmitting && <LinearProgress />}           
                    <Button
                        type="submit"
                        fullWidth
                        variant='contained'
                        color="primary"
                        disabled={isSubmitting}
                        className={classes.submit}                 
                    >
                        Entrar
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2" onClick={redirectRecovery}>
                                Esqueceu sua senha?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="#" variant="body2" onClick={redirectSignup}>
                                {"Não tem uma conta? Cadastre-se!"}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
                <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
                        {loginSuccess
                            ? <Alert severity="success">{successMsg}</Alert>
                            : <Alert severity="error" >{errorMsg}</Alert>
                        }                       
                </Snackbar>
            </div>
            <Divider />
            <div className={classes.social}>
              <Button
                className={classes.fb_button}
                fullWidth
                variant='contained'
                startIcon={<Facebook />}
                href="oauth2/authorization/facebook"
              >
                Continue com Facebook
              </Button>
            </div>
        </Container>
    );
}

