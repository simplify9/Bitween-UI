import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError,} from '@reduxjs/toolkit/query';
import {Mutex} from 'async-mutex';
import {API_BASE_URL} from "src/env";

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        // const token = (getState() as any)?.user?.accessToken;
        const token = sessionStorage.getItem("access_token");
        console.log(token)
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
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions) as any

    // if (result?.error?.data?.status === 401) {
    //
    //
    //     if (mutex.isLocked()) {
    //         await mutex.waitForUnlock();
    //         return baseQuery(args, api, extraOptions);
    //     }
    //     const release = await mutex.acquire();
    //     try {
    //         const refreshToken: any = (api.getState() as RootState)?.user
    //             ?.refreshToken;
    //         if (!refreshToken) {
    //             api.dispatch(() => {
    //             });
    //             return;
    //         }
    //         const refreshResult = await refresh(refreshToken, api, extraOptions)
    //
    //         const data = refreshResult?.data as any;
    //         if (data?.jwt) {
    //             sessionStorage.setItem("access_token", data.jwt);
    //             sessionStorage.setItem("refresh_token", data.refreshToken);
    //
    //             api.dispatch(setTokens({
    //                 refreshToken: data.refreshToken,
    //                 accessToken: data.jwt,
    //             }))
    //         }
    //
    //         if (data)
    //             return await baseQuery(args, api, extraOptions);
    //         sessionStorage.removeItem("access_token");
    //         sessionStorage.removeItem("refresh_token");
    //         window.location.reload()
    //     } finally {
    //         release();
    //     }
    // }
    return result;
};
const refresh = (refreshToken: string, api: any, extraOptions: any) => {
    return baseQuery(
        {
            url: 'tokens/refresh',
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