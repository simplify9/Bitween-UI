import React, {useState} from "react";
import {useAuthApi} from "src/client/components";
import {apiClient} from "src/client";
import Button from "src/components/common/forms/Button";
import SignInWithMsButton from "src/components/Login/SignInWithMsButton";
import {ToastContainer} from "react-toastify";
import {useTypedSelector} from "src/state/ReduxSotre";


const Login = () => {
    const theme = useTypedSelector(i => i.theme)
    const {login} = useAuthApi();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("")
    const onSubmit = async () => {

        let res = await apiClient.login({username, password});
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
    return (

        <div className="bg-white dark:bg-gray-900 relative">
            <ToastContainer/>
            {theme.loginLogo &&
                <img src={`${theme.loginLogo}`} className={"object-cover absolute mt-5 h-10 bottom-5 left-5"}/>}

            <div className="flex justify-center h-screen">
                <div className="hidden bg-cover lg:block lg:w-2/3"
                     style={{
                         backgroundImage: "url(https://www.ship-technology.com/wp-content/uploads/sites/8/2022/02/GettyImages-968819844-scaled.jpg)"
                     }}
                >
                    <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
                        <div>
                            {theme.bitweenText &&
                                <img src={`${theme.bitweenText}`} className="w-auto h-12 sm:h-8" alt=""/>}
                            <p className="max-w-xl mt-3 text-gray-200">
                                {theme.bitweenText}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
                    <div className="flex-1">
                        <div className="text-center">
                            <div className="flex justify-center mx-auto">
                                {theme.bitweenLogo &&
                                    <img src={`${theme.bitweenLogo}`} className="w-auto h-12 sm:h-8" alt=""/>}
                            </div>
                            <p className="mt-3 text-gray-500 dark:text-gray-300">Sign in to access your account</p>
                        </div>

                        <div className="mt-8">
                            <form>
                                <div>
                                    <label htmlFor="email"
                                           className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Email
                                        Address</label>
                                    <input value={username} onChange={(e) => setUsername(e.target.value)} type="email"
                                           name="email" id="email" placeholder="example@example.com"
                                           className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"/>
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between mb-2">
                                        <label htmlFor="password"
                                               className="text-sm text-gray-600 dark:text-gray-200">Password</label>

                                    </div>

                                    <input value={password} onChange={(e) => setPassword(e.target.value)}
                                           type="password" name="password" id="password" placeholder="Your Password"
                                           className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"/>
                                </div>

                                <div className="mt-6 w-full">

                                    <Button onClick={onSubmit} className={"w-full py-2"}>
                                        Sign in
                                    </Button>

                                </div>
                                <SignInWithMsButton/>
                                {
                                    error && <div className={"text-center mt-3 text-red-500"}>
                                        {error}
                                    </div>
                                }
                            </form>


                        </div>
                    </div>
                </div>
            </div>
        </div>)
}

export default Login;
