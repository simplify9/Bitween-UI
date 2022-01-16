import React, {useEffect, useState} from 'react';
import { Route} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import IAppStateModel from "../../Types/AppState";
import {Routes, useLocation,Navigate} from "react-router-dom";
import CookiesManager from "../../Utils/CookiesManager";
import {useTranslation} from "react-i18next";
import Loading from "../Shared/Loading";
import CommonLayout from "./CommonLayout";





interface IProps {

}

const Layout = (props: IProps & any) => {
    const {profileId, isLoading} = useSelector((state: IAppStateModel) => {
        return {
            profileId: state.profile?.id,
            isLoading: state.isLoading
        }
    });

    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(!!CookiesManager.getAccessToken());
    const {i18n} = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {

        if (!profileId) {
            const jwt = CookiesManager.getAccessToken();
            if (jwt) {
               // dispatch(SetProfile(jwt));
                setAuthenticated(true);
            } else setAuthenticated(false);
        } else {
            setAuthenticated(true)
        }
    }, [profileId])


    return (
        <>
            {!authenticated && <Navigate to={`/login?returnurl=${location.pathname}`}/>}
            {authenticated && location.pathname == "/" && <Navigate to={`/`}/>}
            {isLoading && <Loading/>}

            <CommonLayout>
                <Routes>
                    {/*<Route path={"/rides"}>*/}
                    {/*    <Rides/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/users"}>*/}
                    {/*    <Users/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/Payments"}>*/}
                    {/*    <Payments/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/iot"}>*/}
                    {/*    <IotDevices/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/areas"}>*/}
                    {/*    <Areas/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/logs"}>*/}
                    {/*    <Logs/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/mobiles"}>*/}
                    {/*    <MobileDevices/>*/}
                    {/*</Route>*/}
                    {/*<Route path={"/staff"}>*/}
                    {/*    <Staff/>*/}
                    {/*</Route>*/}
                    {/*<Route exact path={"/notifications"}>*/}
                    {/*    <Notifications/>*/}
                    {/*</Route>*/}
                    {/*<Route exact path={"/"}>*/}
                    {/*    <Home/>*/}
                    {/*</Route>*/}



                </Routes>
            </CommonLayout>
        </>
    )
}

export default Layout;
