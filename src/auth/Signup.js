import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Alert from '../components/Alert';
import { useHistory } from 'react-router-dom';
import { Button, CssBaseline, Link, makeStyles, Snackbar, TextField, Typography } from '@material-ui/core';


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

export default function Signup(props) {    
    const classes = useStyles();
    const history = useHistory();

    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[confirmPassword, setConfirmPassword] = useState("");
    const[name, setName] = useState("");    
    const[email, setEmail] = useState("");

    const successMsg = "Usuário criado com sucesso!";
    const[errorMsg, setErrorMsg] = useState("");
    const[signupSuccess, setSuccess] = useState(false);
    const[snack, showSnack] = useState(false);
    
    const sendSignup = () => {
        const url = "/api/user/signup";
        const options = {
            method: 'POST',            
            headers: { 
                'Content-Type': 'application/json;charset=utf-8' 
            },    
            body: JSON.stringify({
                "name": name,
                "email": email,                
                "username": username,
                "password": password,
                "confirmPassword": confirmPassword
            })
        };
        
        fetch(url, options)
            .then(res => {
                if (res.status === 201) {
                    setSuccess(true);
                    showSnack(true);
                    setTimeout(() => { history.push('/login'); }, 2000);
                } else {
                    setSuccess(false);
                    throw new Error("Não foi possivel criar o usuário! Tente novamente.");
                }                    
            })            
            .catch(error => {
                if (!signupSuccess) {
                    setErrorMsg(error.message);                    
                } else {
                    setErrorMsg("Falha ao comunicar com o servidor! Por favor, atualize o navegador e tente novamente");
                }              
                showSnack(true);
            });               
    };
      
    const handleSubmit = (event) => {
        event.preventDefault();
        sendSignup();        
    };    
    
    return(
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Typography variant="h4">
                    Cadastrar novo usuário
                </Typography>
                <form onSubmit={handleSubmit} className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Nome e Sobrenome"
                        name="name"
                        autoFocus
                        onChange={i => setName(i.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Endereço de Email"
                        name="email"
                        autoComplete="email"
                        onChange={i => setEmail(i.target.value)}
                    />
                    
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Nome de Usuário"
                        name="username"
                        autoComplete="username"
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
                    <TextField 
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="confirmPassword"
                        label="Confirmar Senha"
                        name="confirmPassword"
                        type="password"
                        autoComplete="current-password"
                        onChange={i => setConfirmPassword(i.target.value)}
                    />                            
                    <Button
                        type="submit"
                        fullWidth
                        variant='contained'
                        color="primary"
                        className={classes.submit}                 
                    >
                        Cadastrar
                    </Button>                    
                </form>
                <Snackbar open={snack} autoHideDuration={5000} onClose={() => showSnack(false)} >
                        {signupSuccess
                            ? <Alert severity="success">{successMsg}</Alert>
                            : <Alert severity="error" >{errorMsg}</Alert>
                        }
                </Snackbar>
            </div>            
        </Container>
    );
}

