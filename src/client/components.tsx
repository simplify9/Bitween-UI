import React, {useContext, useEffect, useMemo, useState} from "react";
import {
  addAxiosInterceptors,
  isLoggedInCallback,
  loginCallback,
  logoutCallback
} from "./api";
import {AccessTokenResponse, AuthApi, AuthConfig} from "./types";
import {client} from "src/client/index";
import Ac from "src/authConfig";

const noOp = () => {
}
const authApiContext = React.createContext<AuthApi>({
  login: noOp,
  logout: noOp,
  isLoggedIn: false
});

export const AuthApiProvider: React.FC<{ authApp: AuthConfig, children?: React.ReactNode; }> = ({
                                                                                                  authApp,
                                                                                                  children
                                                                                                }) => {

  const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null);

  const api = useMemo(() => ({
    login: (response: AccessTokenResponse) => {
      loginCallback(authApp)(response).then(_ => setLoggedIn(true))
      addAxiosInterceptors(client, Ac);

    },
    logout: logoutCallback(authApp),
    isLoggedIn
  }), [isLoggedIn, authApp]);

  useEffect(() => {
    isLoggedInCallback(authApp)()
      .then(value => {
        setLoggedIn(value);
      });
  }, [authApp]);

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
