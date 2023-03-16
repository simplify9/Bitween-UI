import {NavLink} from "react-router-dom";
import React from "react";
import AuthConfig from "src/authConfig";
import {RiDashboardFill} from "react-icons/ri"
import {BsFillPersonFill} from "react-icons/bs";
import {TbArrowsRandom, TbBellRinging2Filled, TbExchange} from "react-icons/tb";
import {HiDocument} from "react-icons/hi";

// style={{backgroundColor:"#e3311d"}}
const resolveClassName = ({isActive}: any) => {
    return (isActive
        ? "   bg-primary-600  text-white font-bold cursor-default "
        : " cursor-pointer  text-primary-600 mr-4 hover:text-white") + " flex flex-row items-center  hover:bg-primary-600 px-3 py-1 md:my-5 mx-2 md:py-3 md:px-6 mt-4 lg:mt-0 block rounded"
}


const NavBar = () => {
    return (
        <div className={"flex h-full pl-2 py-3"}>
            <nav
                className="flex flex-col bg-white w-full h-full shadow-2xl rounded-xl overflow-hidden h-full">
                <div className="flex flex-col justify-center items-center  text-white pt-5 pb-2 bg bg-white">
                    <NavLink to="/">
                        <div
                            className="font-semibold text-xl tracking-tight px-5 ">

                            <img alt={"B I T W E E N"} src={"/Graphics/BitweenFull.png"}/>

                        </div>
                    </NavLink>
                </div>
                <div className="text-sm h-full flex flex-col  justify-between pt-10 ">
                    <div>
                        <NavLink to="/dashboard" className={resolveClassName}>
                            <RiDashboardFill
                                className={" mr-2"} size={27}/>Dashboard</NavLink>
                        <NavLink to="/Xchanges"
                                 className={resolveClassName}><TbExchange className={" mr-2"}
                                                                          size={27}/> Xchanges</NavLink>
                        <div className={"border border-b mx-3 my-2"}/>

                        <NavLink to="/subscriptions"
                                 className={resolveClassName}><TbArrowsRandom className={"mr-2"}
                                                                              size={27}/> Subscriptions</NavLink>
                        <NavLink to="/documents"
                                 className={resolveClassName}><HiDocument className={" mr-2"}
                                                                          size={27}/> Documents</NavLink>

                        <NavLink to="/partners"
                                 className={resolveClassName}><BsFillPersonFill className={"mr-2"}
                                                                                size={27}/> Partners</NavLink>
                        <NavLink to="/notifiers"
                                 className={resolveClassName}><TbBellRinging2Filled className={"t mr-2"}
                                                                                    size={27}/> Notifiers</NavLink>
         

                    </div>
                   

                </div>
            </nav>
        </div>
    );
}

export default React.memo(NavBar)
