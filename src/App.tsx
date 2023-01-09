import Dashboard from "./components/Dashboard";
import Helmet from 'react-helmet';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Exchanges from './components/Exchanges';
import Subscriptions from './components/Subscriptions';
import NavBar from './components/NavBar';
import {useAuthApi} from "./client/components";
import Login from "./components/Login";
import Documents from "./components/Documents";
import Partners from "./components/Partners";
import Partner from "./components/Partner";
import Subscription from "./components/Subscription";
import Document from "./components/Document";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import Settings from "src/components/Settings";

function App() {

    const {isLoggedIn} = useAuthApi();

    if (!isLoggedIn) return <Login/>;
    
    return (
        <>
            <Helmet>
                <title>Infolink</title>
            </Helmet>
            <ToastContainer/>

            <div>

                <Router>

                    <div className={"flex flex-col md:flex-row "}>
                        <div className={"md:w-[13%] "}>
                            <NavBar/>
                        </div>
                        <div className={"md:w-[85%] overflow-scroll  md:rounded-xl md:h-[98vh] md:shadow-lg m-3  "}>
                            {/*<div className={"mx-5 my-3 shadow-lg border rounded-xl"}>*/}
                            <Routes>
                                <Route path="/" element={<Dashboard/>}/>
                                <Route path="/settings" element={<Settings/>}/>
                                <Route path="/exchanges" element={<Exchanges/>}/>
                                <Route path="/subscriptions" element={<Subscriptions/>}/>
                                <Route path="/documents" element={<Documents/>}/>
                                <Route path="/partners" element={<Partners/>}/>
                                <Route path="/partners/:id" element={<Partner/>}/>
                                <Route path="/documents/:id" element={<Document/>}/>
                                <Route path="/subscriptions/:id" element={<Subscription/>}/>
                            </Routes>
                            {/*</div>*/}
                        </div>
                    </div>

                </Router>

            </div>

        </>
    );
}

export default App;
