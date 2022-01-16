import React from 'react';
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";

import {useSelector} from "react-redux";
import IAppStateModel from "../../Types/AppState";
import {Hidden} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {createStyles, Theme} from "@material-ui/core/styles";
import SideBar from '../Shared/SideBar';


interface IProps {
    children: any
}


const Layout = (props: IProps & any) => {
    const profile = useSelector((state: IAppStateModel) => state.profile);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const classes = useStyles();
    return (
        <>
            <div className={classes.root}>
                <nav className={classes.drawer}>
                    <Hidden smUp implementation="js">
                        <SideBar
                            PaperProps={{style: {width: drawerWidth}}}
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                        />
                    </Hidden>
                    <Hidden xsDown implementation="css">
                        <SideBar PaperProps={{style: {width: drawerWidth}}}/>
                    </Hidden>
                </nav>

                <div className={classes.app}>
                    <Header onDrawerToggle={handleDrawerToggle}/>
                    <main className={classes.main}>
                        {props.children}
                    </main>
                    <Footer/>
                </div>
            </div>

        </>
    )
}
const drawerWidth = 256;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            minHeight: '100vh',
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        app: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        },
        main: {
            flex: 1,
            padding: theme.spacing(6, 4),
            background: '#eaeff1',
        },
        footer: {
            padding: theme.spacing(2),
            background: '#eaeff1',
        },
    }),
);

export default Layout;
