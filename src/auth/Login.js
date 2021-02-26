import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Alert from 'components/Alert'
import { Avatar, Button, CssBaseline, LinearProgress, Link, makeStyles, Snackbar, TextField, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
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
        marginTop: theme.spacing(3),
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

        fetch(url, options)
        .then(
            (res) => {
              switch (res.status) {
                case 200:
                  sessionStorage.setItem("token", res.headers.get("Authorization"));
                  sessionStorage.setItem("loggedUsername", state.username);
                  setSuccess(true);
                  showSnack(true);
                  setTimeout(() => {
                    history.push("/home");
                  }, 500);
                  break;
                case 403:
                  setSuccess(false);
                  setErrorMsg("Usuário ou senha incorretos!");
                  break;
                case 401:
                  setSuccess(false);
                  setErrorMsg("Usuário ou senha incorretos!");
                  break;
                case 500:
                  setSuccess(false);
                  setErrorMsg("Algo deu errado em nosso servidor!");
                  break;
                default:
                  setSuccess(false);
                  setErrorMsg("Erro inesperado do servidor: " + res.status);
              }

              showSnack(true);
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
        [name]: value
      });
    }
      
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitting(true);
        sendLogin();
        setSubmitting(false);
    };    
    
    return(
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar
                    className={classes.logo}
                    src={logo}
                />
                <Typography variant="h3">
                    Agenda Marítima
                </Typography>
                <form onSubmit={handleSubmit} className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Nome de Usuário"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={state.username}
                        onChange={handleChange}
                    />
                    <TextField 
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="password"
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
        </Container>
    );
}

