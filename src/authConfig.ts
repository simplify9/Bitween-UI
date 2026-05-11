import {AuthConfig} from "./client/types";
import {LocalStorage, MemoryRepo} from "./client/repos";
import {apiClient} from "src/client";


const authConfig: AuthConfig = {
    accessTokenCache: new LocalStorage("access_token"),
    // Sentinel value — keeps the refresh flow alive. The actual refresh token
    // lives in an HttpOnly cookie; JS never sees it.
    refreshTokenCache: new MemoryRepo("use-cookie"),
    accessTokenGenerator: async () => {
        // No refresh token body needed — the browser sends the HttpOnly cookie automatically.
        const res = await apiClient.login({})
        if (res.succeeded) {
            return Promise.resolve(
                {
                    accessToken: res.data.jwt,
                    refreshToken: null,
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
    logOutHandler: async () => {
        try { await apiClient.logout(); } catch { /* best effort — clears server-side cookie */ }
        localStorage.removeItem("access_token");
        window.location.reload()

    },
    refreshTokenExpiry: null
}

export default authConfig;
