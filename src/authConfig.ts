import {AuthConfig} from "./client/types";
import {SessionStorage} from "./client/repos";
import {apiClient} from "src/client";


const authConfig: AuthConfig = {
    accessTokenCache: new SessionStorage("access_token"),
    refreshTokenCache: new SessionStorage("refresh_token"),
    accessTokenGenerator: async (axios, refreshToken) => {

        const res = await apiClient.login({refreshToken})
        if (res.succeeded) {
            return Promise.resolve(
                {
                    accessToken: res.data.jwt,
                    refreshToken: res.data.refreshToken,
                    accessTokenExpiry: 3
                }
            );
        }
        return Promise.resolve(
            {
                accessToken: null,
                refreshToken: null,
                accessTokenExpiry: 0
            })

    },
    logOutHandler: () => {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.reload()

    },
    refreshTokenExpiry: null
}

export default authConfig;
