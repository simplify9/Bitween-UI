import dayjs from "dayjs";
import {AiFillGithub, AiFillLinkedin} from "react-icons/ai";
import React from "react";

const Footer = () => {
    return <div className={""}>
        <footer className="bg-white shadow-lg rounded-lg ">
            <div
                className="container flex flex-col items-center justify-between p-6 py-3 mx-auto space-y-4 sm:space-y-0 sm:flex-row">
                <div></div>

                <div>
                    <p className="text-sm text-gray-600 d">© {dayjs().year()} <a
                        className={"underline text-red-600 font-semibold"}
                        href={"https://www.simplify9.com/"}>Simplify9</a> All
                        Rights Reserved.</p>
                </div>


                <div className="flex -mx-2">

                    <a href="https://www.linkedin.com/company/simplify9"
                       className="mx-2 text-gray-600 transition-colors duration-300  hover:text-blue-500 "
                       aria-label="Facebook">
                        <AiFillLinkedin size={23}/>
                    </a>

                    <a href="https://github.com/simplify9"
                       className="mx-2 text-gray-600 transition-colors duration-300  hover:text-slate-900"
                       aria-label="Github">
                        <AiFillGithub size={23}/>
                    </a>
                </div>
            </div>
        </footer>
    </div>
}
export default Footer