import {useState} from "react";
import {useAuthApi} from "../../client/components";
import {apiClient} from "../../client";


const Login = () => {

    const {login} = useAuthApi();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [failed, setFailed] = useState(false);

    const onSubmit = async () => {

        let res = await apiClient.login({username, password});
        if (res.succeeded) {

            login({
                accessToken: res.data.jwt,
                refreshToken: res.data.refreshToken,
                accessTokenExpiry: 3
            })
        } else {

            setFailed(true);
        }
    }

    return (
        <div
            className="p-4 flex flex-col justify-center min-h-screen max-w-md mx-auto ">
            <div className="p-10 pt-12 pb-16 shadow-lg backdrop-blur-2xl rounded-xl ">
                <div
                    className="flex items-center justify-center text-4xl font-black text-sky-900 m-3">

                    <h1 className="tracking-wide" >Infolink</h1>
                </div>
                <div

                    className="flex flex-col justify-center">
                    <label className="text-sm font-medium">Username</label>
                    <input className="mb-3 px-2 py-1.5
          mb-3 mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
          focus:outline-none
          focus:border-sky-500
          focus:ring-1
          focus:ring-sky-500
          focus:invalid:border-red-500 focus:invalid:ring-red-500" type="email"
                           name="username"
                           placeholder="john@simth.com"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           required/>
                    <label className="text-sm font-medium">Password</label>
                    <input className="
          mb-3 mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
          focus:outline-none
          focus:border-sky-500
          focus:ring-1
          focus:ring-sky-500
          focus:invalid:border-red-500 focus:invalid:ring-red-500"
                           type="password" name="password"
                           placeholder="********" required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                    />
                    {failed &&
                        <a className="pb-4 text-red-600">Wrong username or password</a>}
                    <button
                        className="mt-5 px-4 py-1.5 rounded-md shadow-lg bg-sky-600 font-medium text-gray-100 block hover:bg-sky-700 transition duration-300"

                        onClick={() => onSubmit()}>
                        <span className="hidden">Checking ...</span>
                        <span>Login</span></button>
                </div>
            </div>
        </div>)

}

export default Login;
