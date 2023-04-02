import Dashboard from "./components/Dashboard";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Exchanges from './components/Exchanges';
import Subscriptions from './components/Subscriptions';
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
import Notifier from "src/components/Notifier";
import Notifiers from "src/components/Notifiers";
import Notifications from "src/components/Notifications";
import Header from "src/components/common/layout/Header";
import NavBar from "src/components/common/layout/NavBar";
import Team from "src/components/Team";
import Footer from "src/components/common/layout/Footer";

function App() {

    const {isLoggedIn} = useAuthApi();


    if (!isLoggedIn) return <Login/>;

    return (
        <>
            <ToastContainer/>
            <Router>
                <div className={"flex flex-col justify-between items-stretch bg-slate-100 py-3  h-[100vh] px-3  "}>

                    <div className={"flex flex row     "}>
                        <div className={"md:w-[11%]  "}>
                            <NavBar/>
                        </div>
                        <div
                            className={"md:w-[89%]  px-2   rounded-lg md:h-[92.5vh] overflow-scroll pl-4 overflow-hidden "}>
                            <Header/>
                            <div className={"pt-3 pb-5"}>
                                
                          
                            <Routes>
                                <Route path="/" element={<Exchanges/>}/>
                                <Route path={"dashboard"} element={<Dashboard/>}/>
                                <Route path="/settings" element={<Settings/>}/>
                                <Route path="/notifiers" element={<Notifiers/>}/>
                                <Route path="/Xchanges" element={<Exchanges/>}/>
                                <Route path="/subscriptions" element={<Subscriptions/>}/>
                                <Route path="/documents" element={<Documents/>}/>
                                <Route path="/partners" element={<Partners/>}/>
                                <Route path="/partners/:id" element={<Partner/>}/>
                                <Route path="/documents/:id" element={<Document/>}/>
                                <Route path="/subscriptions/:id" element={<Subscription/>}/>
                                <Route path="/notifiers/:id" element={<Notifier/>}/>
                                <Route path={"/notifications"} element={<Notifications/>}/>
                                <Route path={"/team"} element={<Team/>}/>
                            </Routes>
                            </div>
                        </div>
                    </div>

                    <div className={"md:h-[4%] px-2 bg-transparent"}>
                        <Footer/>
                    </div>

                </div>
            </Router>


        </>
    );
}

export default App;
