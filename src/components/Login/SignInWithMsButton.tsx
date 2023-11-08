import {MSAL_CLIENT_ID} from "src/env";
import {PublicClientApplication} from "@azure/msal-browser";
import {apiClient} from "src/client";
import {useAuthApi} from "src/client/components";

const msalConfig = {
    auth: {
        clientId: MSAL_CLIENT_ID
    }
};

const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize().then()
const SignInWithMsButton = () => {
    const {login} = useAuthApi();

    const onClickLoginWithMicrosoft = async () => {
        const msRes = await msalInstance.loginPopup({
            redirectUri: "http://localhost:3000/",
            scopes: ["openid", "profile", "User.Read"]
        });
        if (msRes.idToken) {
            let res = await apiClient.login({msToken: msRes.idToken});
            await login({
                accessToken: res.data.jwt,
                refreshToken: res.data.refreshToken,
                accessTokenExpiry: 3
            })
        }


    }

    if (!MSAL_CLIENT_ID)
        return null
    return <div onClick={onClickLoginWithMicrosoft} className={"my-5"}>

        <img src={"/external/ms.svg"} className={"w-full h-[42px]"}/>
    </div>

}
export default SignInWithMsButton