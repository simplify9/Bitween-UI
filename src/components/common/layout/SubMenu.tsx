import React, {useState} from "react";
import Button from "src/components/common/forms/Button";
import {NavLink} from "react-router-dom";
import {IoSettingsSharp} from "react-icons/io5";
import {FaSignOutAlt} from "react-icons/fa"
import {RiTeamFill} from "react-icons/ri";
import {BiHelpCircle} from "react-icons/bi"
import AuthConfig from "src/authConfig";

type Props = {
    children: React.ReactNode
}


const SubMenu: React.FC<Props> = ({children}) => {

    const [isOpen, setIsOpen] = useState(false)


    return <div className="relative inline-block " style={{zIndex: 1000000}}>

        <Button
            variant={"none"}
            onClick={() => setIsOpen(i => !i)}
        >
            {children}
        </Button>
        {
            isOpen &&
            <div
                onMouseLeave={() => setIsOpen(false)}

                className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-xl dark:bg-gray-800 transition ${isOpen ? " block" : "hidden"}`}
            >


                <hr className="border-gray-200 dark:border-gray-700 "/>

                <NavLink to="team"
                         className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform  hover:bg-gray-100 ">
                    <RiTeamFill size={21}
                                className={"mr-1"}/>

                    <span className="mx-1">Team</span>
                </NavLink>


                <hr className="border-gray-200 dark:border-gray-700 "/>
                <NavLink to="/settings"
                         className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
                    <IoSettingsSharp
                        size={21}
                        className={"mr-1"}/>
                    <span className="mx-1">
                Settings
                </span>
                </NavLink>

                <a href="https://github.com/simplify9/Infolink" target={"_blank"}
                   className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform  hover:bg-gray-100 ">
                    <BiHelpCircle size={21}
                                  className={"mr-1"}/>
                    <span className="mx-1">
                Help
            </span>
                </a>
                <hr className="border-gray-200 dark:border-gray-700 "/>

                <a onClick={() => AuthConfig.logOutHandler()}
                   className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform d hover:bg-gray-100 ">
                    <FaSignOutAlt className={"mr-1"} size={21}/>
                    <span className="mx-1">
                Sign Out
            </span>
                </a>
            </div>}
    </div>
}

export default SubMenu