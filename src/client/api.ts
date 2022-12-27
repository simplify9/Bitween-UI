import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {AccessTokenResponse, AuthConfig} from "./types";
import {toast} from "react-toastify";


export const isLoggedInCallback = ({accessTokenCache}: AuthConfig) =>
    async () => {
        const value = await accessTokenCache.read();
        return value !== null;
    };


export const logoutCallback = ({
                                   refreshTokenCache,
                                   logOutHandler
                               }: AuthConfig) => {
    return async () => {
        await refreshTokenCache?.drop();
        logOutHandler();
    }
}

export const loginCallback = ({
                                  accessTokenCache,
                                  refreshTokenCache,
                                  refreshTokenExpiry
                              }: AuthConfig) => {
    return async (tokens: AccessTokenResponse) => {
        await accessTokenCache.write(tokens.accessToken, tokens.accessTokenExpiry);
        if (refreshTokenCache) {
            await refreshTokenCache?.write(tokens.refreshToken, refreshTokenExpiry);
        }
    }
}

export const ERR_SIGNIN_REQUESTED = "sign-in-requested";

export const oneCallAtATime = <T>(pFn: (...params: any[]) => Promise<T>) => {
    let pCurrent: Promise<T> | null = null;

    return (...params: any[]) => {
        if (pCurrent !== null) return pCurrent;
        pCurrent = pFn(...params)
            .then(success => {
                pCurrent = null;
                return Promise.resolve(success);
            })
            .catch(error => {
                pCurrent = null;
                return Promise.reject(error);
            });
        return pCurrent;
    }
}

export const addAxiosInterceptors = (axiosInstance: AxiosInstance, config: AuthConfig) => {

    const logOut = logoutCallback(config);

    const login = loginCallback(config);

    const authAxiosInstance = axios.create();

    const getAccessToken = oneCallAtATime(async (triedButFailed: string | null): Promise<string> => {

        const cachedValue = await config.accessTokenCache.read();
        if (cachedValue !== null && cachedValue !== triedButFailed) {
            return cachedValue;
        }

        // drop from cache
        await config.accessTokenCache.drop();

        const refreshToken = config.refreshTokenCache
            ? await config.refreshTokenCache.read()
            : null;


        // create new access / refresh token if possible
        if (refreshToken !== null && config.accessTokenGenerator) {
            try {
                const newTokens = await config.accessTokenGenerator(authAxiosInstance, refreshToken);
                if (newTokens !== null) {
                    await login(newTokens);
                    return newTokens.accessToken;
                }
            } catch (err) {
                // LOG AND MUTE ERROR
                // ...
            }
        }

        await logOut();

        throw ERR_SIGNIN_REQUESTED;
    });

    // INTERCEPTORS

    let accessToken: string | null = null;
    config.accessTokenCache.read().then(a => accessToken = a);
    console.info("accessToken", accessToken)
    axiosInstance.interceptors.request.use((req: AxiosRequestConfig) => {
        // append access token if available
        return accessToken !== null
            ? {
                ...req,
                headers: {...req.headers, "Authorization": `Bearer ${accessToken}`}
            }
            : req;
    });

    axiosInstance.interceptors.response.use(
        // @ts-ignore
        (response: AxiosResponse) => {
            
            console.log("xx",response)
        

            if([204].includes(response.status)){
                toast("Action successful", {type: "success"})
            }
            return {
                status: response.status,
                succeeded: response.status >= 200 && response.status < 300,
                data: response.data,
                error: response.data,
            };
        },
        (error: AxiosError) => {
            if (error.response && error.response.status === 401) {
                return getAccessToken(accessToken)
                    .then(newValue => {
                        accessToken = newValue;
                        // @ts-ignore
                        return axiosInstance(error.config);
                    });
            }

            
            toast(JSON.stringify(error.response?.data, null, 4), {type: "error"})
            return {
                status: error.response?.status,
                succeeded: false,
                error: error.response?.data
            }


        });
}



