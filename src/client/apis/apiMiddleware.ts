import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError,} from '@reduxjs/toolkit/query';
import ENV from "src/env";
import {toast} from "react-toastify";
import {apiClient} from "src/client";
import {Mutex} from "async-mutex";

export const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: ENV.API_BASE_URL,
    prepareHeaders: (headers, {getState}) => {

        // const token = (getState() as any)?.user?.accessToken;
        const token = sessionStorage.getItem("access_token");
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
            return headers;
        }
        return headers;
    },
});


const customFetchBase: BaseQueryFn<
    string | FetchArgs,
    any,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {


    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions)
    if (204 === result?.meta?.response?.status) {
        toast("Action successful.", {type: "success",})
    }
    if (result?.error && [404, 400, 500].includes(result?.error?.status as number)) {
        toast("Something went wrong: " + JSON.stringify(result.error, null, 4), {type: "error"})

    }
    if (result?.error?.status === 401) {
        try {
            if (mutex.isLocked()) {
                await mutex.waitForUnlock();
                return baseQuery(args, api, extraOptions);
            } else {
                await mutex.acquire();
                await apiClient.getProfile()
            }
        } finally {
            mutex.release()
        }

        // const release = await mutex.acquire();
        // try {
        //     const refreshToken: any = (api.getState() as RootState)?.user
        //         ?.refreshToken;
        //     if (!refreshToken) {
        //         logout()
        //         return;
        //     }
        //     const refreshResult = await refresh(refreshToken, api, extraOptions)
        //
        //     const data = refreshResult?.data as any;
        //     if (data?.jwt) {
        //         sessionStorage.setItem("access_token", data.jwt);
        //         sessionStorage.setItem("refresh_token", data.refreshToken);
        //
        //         api.dispatch(setTokens({
        //             refreshToken: data.refreshToken,
        //             accessToken: data.jwt,
        //         }))
        //         return await baseQuery(args, api, extraOptions);
        //
        //     }
        //
        //     logout()
        //
        // } finally {
        //     release();
        // }
    }
    return result;
};
const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    window.location.reload()
}
const refresh = (refreshToken: string, api: any, extraOptions: any) => {
    return baseQuery(
        {
            url: 'accounts/login',
            method: 'POST',
            body: {
                refreshToken,
            },
        },
        api,
        extraOptions,
    );

}
export default customFetchBase;