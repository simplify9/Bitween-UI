import React from 'react';
import Header from "../Shared/Header";
import Footer from "../Shared/Footer";
import {Navigate, Route, Routes} from "react-router";
import Login from "../Views/Auth/Login";
import {useSelector} from "react-redux";
import IAppStateModel from "../../Types/AppState";
import {useLocation} from "react-router-dom";
import CommonLayout from "./CommonLayout";

interface IProps {

}

const Layout = (props: IProps & any) => {
    const profile = useSelector((state: IAppStateModel) => state.profile);
    const location = useLocation();

    return (
        <>
            {profile?.id && <Navigate to={`${location.search.slice(11)}`}/>}


                {/*<Routes>*/}
                    <Route path="/">
                        <Login />
                    </Route>
                {/*</Routes>*/}



        </>
    )
}

export default Layout;
