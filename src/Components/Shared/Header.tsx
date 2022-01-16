import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {Help,Menu,Notifications,ExitToApp} from '@mui/icons-material';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';
import {makeStyles} from "@material-ui/styles";
import {useTranslation} from "react-i18next";
import CookiesManager from "../../Utils/CookiesManager";
import {Logout} from "../../State/Actions/ProfileActions";
import {useDispatch} from "react-redux";

const lightColor = 'rgba(255, 255, 255, 0.7)';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuButton: {
            marginLeft: -theme.spacing(1),
        },
        iconButtonAvatar: {
            padding: 4,
        },
        link: {
            textDecoration: 'none',
            color: lightColor,
            '&:hover': {
                color: theme.palette.common.white,
            },
        },
        button: {
            borderColor: lightColor,
        },
    }),
);

const Header = (props:any) => {

    const classes = useStyles();
    const {i18n, t} = useTranslation("navigation");
    const dispatch = useDispatch();

    return (

            <AppBar color="primary" position="sticky" elevation={0}>
                <Toolbar>
                    <Grid container spacing={1} alignItems="center">
                        <Hidden smUp>
                            <Grid item>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={props.onDrawerToggle}
                                    className={classes.menuButton}
                                >
                                    <Menu />
                                </IconButton>
                            </Grid>
                        </Hidden>
                        <Grid item xs />
                        <Grid item>
                            <Tooltip title="language">
                                <Button
                                    onClick={() => {
                                        i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
                                        CookiesManager.setLocale(i18n.language);
                                    }}
                                    color="inherit"
                                >
                                {t("lang")}
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Alerts • No alerts">
                                <IconButton color="inherit">
                                    <Notifications />
                                </IconButton>

                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <IconButton color="inherit" className={classes.iconButtonAvatar}>
                                <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Alerts • No alerts">
                                <IconButton onClick={() => dispatch(Logout())} color="inherit">
                                    <ExitToApp />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>


    );
}

export default Header;
