import {NavLink} from "react-router-dom";
import React from "react";
import {RiDashboardFill} from "react-icons/ri"
import {BsFillPersonFill} from "react-icons/bs";
import {TbArrowsRandom, TbBellRinging2Filled, TbExchange} from "react-icons/tb";
import {HiDocument} from "react-icons/hi";
import {AiOutlineArrowLeft, AiOutlineArrowRight} from "react-icons/ai"
// style={{backgroundColor:"#e3311d"}}
const resolveClosedClassName = ({isActive}: any) => {

    return (isActive
        ? "   bg-primary-600  text-white font-bold cursor-default  "
        : " cursor-pointer  text-primary-600  hover:text-white") + " flex items-center justify-center transition-colors duration-150 hover:bg-primary-500  block mx-2 min-h-[54px] rounded-lg "
}

const resolveOpenClassName = ({isActive}: any) => {
    return (isActive
        ? "   bg-primary-600  text-white font-bold cursor-default  "
        : " cursor-pointer  text-primary-600 mr-4 hover:text-white") + " gap-3 transition-colors duration-150 flex flex-row items-center  hover:bg-primary-500 px-3 py-1 md:my-5 mx-2 md:py-3 md:px-6 mt-4 lg:mt-0 block rounded"
}

type Props = {
    isOpen: boolean
    setIsOpen: (o: boolean) => void
}
const NavBar: React.FC<Props> = ({isOpen, setIsOpen}) => {
    return (
        <div className={"flex h-full pl-2 "}>
            <nav
                className="flex flex-col bg-white w-full h-full shadow-2xl rounded-xl overflow-hidden h-full">
                <div className="flex flex-col justify-center items-center  text-white pt-5 pb-2 bg bg-white">
                    <NavLink to="/">
                        <div
                            className={`font-semibold  text-xl tracking-tight px-5 duration-300 transition-w  ease-in-out ${!isOpen ? "hidden" : "block"}`}>
                            <img alt={"B I T W E E N"} className={"h-20 object-contain"}
                                 src={"/Graphics/BitweenFull.png"}/>
                        </div>
                        <div
                            className={`font-semibold text-xl tracking-tight px-5 duration-300 transition-w h-20 w-20 ease-in-out ${isOpen ? "hidden" : "block"}`}>
                            <img alt={"B I T W E E N"} className={"h-20 w-10 object-contain"}
                                 src={"/Graphics/BitweenIcon.png"}/>
                        </div>
                    </NavLink>
                </div>
                <div className="text-sm h-full flex flex-col  justify-between pt-10 ">
                    <div>
                        <NavLink to="/dashboard"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            <div>
                                <RiDashboardFill
                                    className={"w-6 h-6"} size={27}/>
                            </div>

                            <span className={isOpen ? "block" : "hidden"}>   Dashboard</span>

                        </NavLink>
                        <NavLink to="/Xchanges"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            <div>
                                <TbExchange
                                    className={"w-6 h-6"}
                                    size={27}/>
                            </div>


                            <span className={isOpen ? "block" : "hidden"}>   Xchanges</span>

                        </NavLink>
                        <div className={"border border-b mx-2 mt-12 mb-3"}/>
                        <NavLink to="/subscriptions"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            <div>
                                <TbArrowsRandom
                                    className={"w-6 h-6"}
                                    size={27}/>
                            </div>

                            <span className={isOpen ? "block" : "hidden"}>Subscriptions</span>
                        </NavLink>
                        <NavLink to="/documents"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            {/*<img src={"/Icons/document-white.svg"}/>*/}
                            <div>


                                <HiDocument
                                    className={"w-6 h-6"}
                                    size={27}/>
                            </div>
                            <span className={isOpen ? "block" : "hidden"}>Documents</span>

                        </NavLink>

                        <NavLink to="/partners"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            <div><BsFillPersonFill
                                className={"w-6 h-6"}
                                size={27}/></div>

                            <span className={isOpen ? "block" : "hidden"}>Partners</span>

                        </NavLink>
                        <NavLink to="/notifiers"
                                 className={(isOpen ? resolveOpenClassName : resolveClosedClassName)}>
                            <div>
                                <TbBellRinging2Filled className={"w-6 h-6"}
                                                      size={27}/>
                            </div>

                            <span className={isOpen ? "block" : "hidden"}>Notifiers</span>

                        </NavLink>


                    </div>

                    <div className={"flex mb-5 text-primary-500 justify-center"} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <AiOutlineArrowLeft size={33}/> : <AiOutlineArrowRight size={33}/>}
                    </div>

                </div>
            </nav>
        </div>
    );
}

export default React.memo(NavBar)
