import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import { Button, CssBaseline, Link, makeStyles, Snackbar, TextField, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
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
    error: {
        marginTop: theme.spacing(1),        
    },
    hide: {
        display:'none',
    },
}));


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }


export default function Login(props) {    
    const classes = useStyles();
    const history = useHistory();

    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const successMsg = "Login com sucesso!";
    const[errorMsg, setErrorMsg] = useState("");
    const[loginSuccess, setSuccess] = useState(false);
    const[snack, showSnack] = useState(false);

    const redirectSignup = () => {
        history.push('/signup');
    }

    const sendLogin = () => {
        const url = "/login";
        const options = {
            method: 'POST',
            mode: 'no-cors',              
            body: JSON.stringify({
                username: username,
                password: password
            })
        };
        
        fetch(url, options)
            .then(res => {
                if (res.ok) {
                    sessionStorage.setItem("token", res.headers.get("Authorization"));
                    sessionStorage.setItem("loggedUsername", username);
                    setSuccess(true);
                    showSnack(true);
                    history.push('/home');
                } else {
                    setSuccess(false);
                    throw new Error("Usuário e/ou senha incorretos! Tente novamente.");
                }                    
            })            
            .catch(error => {
                if (!loginSuccess) {
                    setErrorMsg(error.message);                    
                } else {
                    setErrorMsg("Falha ao comunicar com o servidor! Por favor, atualize o navegador e tente novamente");
                }              
                showSnack(true);
            });               
    };
      
    const handleSubmit = (event) => {
        event.preventDefault();
        sendLogin();        
    };    
    
    return(
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Typography variant="h4">
                    Minha Escala Offshore
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
                        onChange={i => setUsername(i.target.value)}
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
                        onChange={i => setPassword(i.target.value)}
                    />                    
                    <Button
                        type="submit"
                        fullWidth
                        variant='contained'
                        color="primary"
                        className={classes.submit}                 
                    >
                        Entrar
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link variant="body2">
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

