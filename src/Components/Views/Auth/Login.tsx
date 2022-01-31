import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {useTranslation} from "react-i18next";
import CookiesManager from "../../../Utils/CookiesManager";
//import AuthClient from "../../../Api/AuthClient";
import {useDispatch} from "react-redux";
import {SetProfile} from "../../../State/Actions/ProfileActions";
import  * as api from "../../../api/generated";

const Component = () => {
    const classes = useStyles();
    const {t, i18n} = useTranslation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    //let client = new AuthClient();
    const dispatch = useDispatch();
    const onLogin = async () => {
        let apiDoc = new api.DocumentsApi();
//        const f = res.data.Result;
        // let res = await client.LoginAsync(username, password);
        // if (res.succeeded) {
        //     dispatch(SetProfile(res.data.jwt))
        //
        // } else {
        //     setErrorMessage(t("auth:errorMessage"))
        // }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <div className={classes.paper}>
                <img width={"500px"} style={{marginBottom: 50}} src={"/Logo-01.png"}/>
                {/*<Avatar className={classes.avatar}>*/}
                {/*    <LockOutlinedIcon color={"action"}  />*/}
                {/*</Avatar>*/}
                <Typography component="h1" variant="h5">
                    {t('auth:title')}
                </Typography>

                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label={t('auth:emailLabel')}
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t('auth:passwordLabel')}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={onLogin}
                >
                    {t('auth:signInButton')}
                </Button>
                <Grid container>
                    <Grid item xs>
                        <Link href="#" variant="body2">
                            {t('auth:forgotPassword')}
                        </Link>
                    </Grid>
                    <Grid item xs>
                        <Button
                            onClick={() => {
                                i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
                                CookiesManager.setLocale(i18n.language);
                            }}
                            color="inherit"
                        >
                            {t("navigation:lang")}
                        </Button>
                    </Grid>

                </Grid>

            </div>
        </Container>
    )
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default Component;
