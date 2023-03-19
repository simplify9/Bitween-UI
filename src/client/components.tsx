import React, {useContext, useEffect, useMemo, useState} from "react";
import {addAxiosInterceptors, isLoggedInCallback, loginCallback, logoutCallback} from "./api";
import {AccessTokenResponse, AuthApi, AuthConfig} from "./types";
import {apiClient, client} from "src/client/index";
import Ac from "src/authConfig";
import {setAccountInfo, setTokens} from "src/state/stateSlices/user";
import {useAppDispatch} from "src/state/ReduxSotre";

const noOp = () => {
}
const authApiContext = React.createContext<AuthApi>({
    login: noOp,
    logout: noOp,
    isLoggedIn: false,
    tokens: undefined
});

export const AuthApiProvider: React.FC<{ authApp: AuthConfig, children?: React.ReactNode; }> = ({
                                                                                                    authApp,
                                                                                                    children
                                                                                                }) => {

    const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null);
    const dispatch = useAppDispatch()

    const api = useMemo(() => ({
        login: (response: AccessTokenResponse) => {
            if (response.accessToken) {
                dispatch(setTokens(response))
            }
            loginCallback(authApp)(response).then(_ => setLoggedIn(true))
            addAxiosInterceptors(client, Ac);

        },
        logout: logoutCallback(authApp),
        isLoggedIn,
    }), [isLoggedIn, authApp]);


    useEffect(() => {
        isLoggedInCallback(authApp)()
            .then(value => {
                setLoggedIn(value);
            });
    }, [authApp]);

    useEffect(() => {
        if (isLoggedIn) {
            setUserInfo()
        }

    }, [isLoggedIn])

    const setUserInfo = async () => {

        const info = await apiClient.getProfile()
        if (info.succeeded) {
            dispatch(setAccountInfo(info.data))
        }

    }


    return (
        isLoggedIn !== null
            ? <authApiContext.Provider
                value={api as AuthApi}>{children}</authApiContext.Provider>
            : null
    );
}

export const useAuthApi = (): AuthApi => {
    return useContext(authApiContext);
}
