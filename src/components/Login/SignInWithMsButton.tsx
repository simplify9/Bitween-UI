import {PublicClientApplication} from "@azure/msal-browser";
import {apiClient} from "src/client";
import {useAuthApi} from "src/client/components";
import {useAppConfigQuery} from "src/client/apis/generalApi";
import {useEffect, useState} from "react";


let msalInstance: PublicClientApplication
const SignInWithMsButton = () => {
    const config = useAppConfigQuery()
    const {login} = useAuthApi();
    const [error, setError] = useState("")
    useEffect(() => {
        
        if (config.data?.msalClientId) {
            const conf = {
                auth: {
                    clientId: config.data.msalClientId,
                    ...(config.data.msalTenantId && { authority: `https://login.microsoftonline.com/${config.data.msalTenantId}` })
                },
            };
            msalInstance = new PublicClientApplication(conf);
            msalInstance.initialize().then()
        }


    }, [config.data?.msalClientId]);

    const onClickLoginWithMicrosoft = async () => {
        const msRes = await msalInstance.loginPopup({
            redirectUri: config.data?.msalRedirectUri,
            scopes: ["openid"]
        });
        if (msRes.idToken) {
            let res = await apiClient.login({msToken: msRes.idToken});
            if (res.succeeded) {
                login({
                    accessToken: res.data.jwt,
                    refreshToken: res.data.refreshToken,
                    accessTokenExpiry: 3
                })
            } else {
                setError("Something went wrong while trying to log you in")
            }

        }
    }

    if (!config.data?.msalClientId || !config.data?.msalRedirectUri)
        return null

    return <div onClick={onClickLoginWithMicrosoft} className={"my-5"}>
        <img src={"/external/ms.svg"} className={"w-full h-[42px]"}/>
        {
            error && <div className={"text-center mt-3 text-red-500"}>
                {error}
            </div>
        }

    </div>

}
export default SignInWithMsButton