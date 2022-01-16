import React from 'react';
import {CircularProgress} from "@material-ui/core";

interface IProps{

}

const Component = (props:IProps) => {


    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                background: "rgba(0, 0, 0, 0.7)",
                zIndex: 9999,
            }}
        >
            <CircularProgress color="secondary" />
        </div>
    )
}

export default Component;
