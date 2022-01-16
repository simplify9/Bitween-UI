import {IAlertModel} from "../../Types/AppState";
import {FunctionComponent} from "react";
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import MuiAlert, {AlertProps} from '@mui/material/Alert';
import {Snackbar} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        minWidth: "20vw",
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    snackBar: {
        paddingRight: 13,
        paddingLeft: 13,


    }
}));

const Alert = (props: AlertProps) => {
    return <MuiAlert elevation={13} variant="filled" {...props} />;
}

const SnackBar: FunctionComponent<IAlertModel> = ({open, severity, message}: IAlertModel): JSX.Element => {

    const classes = useStyles();


    return (
        <div className={classes.root}>
            <Snackbar
                open={open}
                autoHideDuration={7429}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert severity={severity} className={classes.snackBar}
                >
                    {message}
                </Alert>
            </Snackbar>

        </div>
    );
}
export default SnackBar
