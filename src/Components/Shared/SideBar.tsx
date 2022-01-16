import React from 'react';
import clsx from 'clsx';
import {createStyles, Theme} from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {PhonelinkSetup,Home,People,DnsRounded,Timer,Notifications,Settings} from '@mui/icons-material';
import {makeStyles} from "@material-ui/styles";
import {useNavigate, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import FeedIcon from '@mui/icons-material/Feed';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import GroupIcon from '@mui/icons-material/Group';


const categories = [
    {
        id: 'dataSection',
        children: [
            {id: 'notifications', icon: <Notifications/>, route: "/notifications"},


        ],
    },
    {
        id: 'setUpSection',
        children: [
            {id: 'documents', icon: <FeedIcon/>, route: "/documents"},
            {id: 'subscribers', icon: <SubscriptionsIcon/>, route: "/subscribers"},
            {id: 'parteners', icon: <GroupIcon/>, route: "/partners"},
        ],
    },
    {
        id: 'settingsSection',
        children: [
            {id: 'notifier', icon:  <Timer/>, route: "/notifier"},

        ],
    },
];


const Navigator = (props: any) => {
    const {...other} = props;
    const classes = useStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const {t} = useTranslation("navigation");
    return (
        <Drawer variant="permanent" {...other}>
            <List disablePadding>
                <ListItem onClick={() => navigate("/")}
                          className={clsx(classes.firebase, classes.item, classes.itemCategory)}>
                    <img alt={"logo"} width={"100px"} src={"/logo.png"}/>
                </ListItem>
                <ListItem
                    button
                    onClick={() => navigate("/")}
                    className={clsx(classes.item, classes.itemCategory, location.pathname === "/" && classes.itemActiveItem)}>
                    <ListItemIcon className={classes.itemIcon}>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText
                        classes={{
                            primary: classes.itemPrimary,
                        }}
                    >
                        {t("dashboard")}
                    </ListItemText>
                </ListItem>
                {categories.map(({id, children}) => (
                    <React.Fragment key={id}>
                        <ListItem className={classes.categoryHeader}>
                            <ListItemText
                                classes={{
                                    primary: classes.categoryHeaderPrimary,
                                }}
                            >
                                {t(id)}
                            </ListItemText>
                        </ListItem>
                        {children.map(({id: childId, icon, route}) => (
                            <ListItem
                                key={childId}
                                button
                                onClick={() => navigate(route)}
                                className={clsx(classes.item, location.pathname === route && classes.itemActiveItem)}
                            >
                                <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                                <ListItemText
                                    classes={{
                                        primary: classes.itemPrimary,
                                    }}
                                >
                                    {t(childId)}
                                </ListItemText>
                            </ListItem>
                        ))}
                        <Divider className={classes.divider}/>
                    </React.Fragment>
                ))}
            </List>
        </Drawer>
    );
}


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        categoryHeader: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
        categoryHeaderPrimary: {
            color: theme.palette.common.white,
        },
        item: {
            paddingTop: 1,
            paddingBottom: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover,&:focus': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
        },
        itemCategory: {
            backgroundColor: '#232f3e',
            boxShadow: '0 -1px 0 #404854 inset',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2),
        },
        firebase: {
            fontSize: 24,
            color: theme.palette.common.white,
        },
        itemActiveItem: {
            color: '#4fc3f7',
        },
        itemPrimary: {
            fontSize: 'inherit',
        },
        itemIcon: {
            minWidth: 'auto',
            marginRight: theme.spacing(2),
        },
        divider: {
            marginTop: theme.spacing(2),
        },
    }),
);

export default Navigator;
