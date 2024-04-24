import dayjs from "dayjs";
import {AiFillGithub, AiFillLinkedin} from "react-icons/ai";
import React from "react";
import ENV from "src/env";

const Footer = () => {
    return <div className={""}>
        <footer className="bg-white shadow-lg rounded-lg ">
            <div
                className="container flex flex-col items-center justify-between p-6 py-3 mx-auto space-y-4 sm:space-y-0 sm:flex-row">
                <div></div>

                <div>
                    <p className="text-sm text-gray-600 d">{`${ENV.THEME.COPY_RIGHTS_ICON}`} {dayjs().year()} <a
                        className={"underline text-red-600 font-semibold"}
                        href={`${ENV.THEME.WEBSITE_LINK}`}>{`${ENV.THEME.COMPANY_NAME}`}</a> {ENV.THEME.ALL_RIGHTS_RESERVED}</p>
                </div>


                <div className="flex -mx-2">

                    {ENV.THEME.LINKEDIN_LINK && <a href={`${ENV.THEME.LINKEDIN_LINK}`}
                       className="mx-2 text-gray-600 transition-colors duration-300  hover:text-blue-500 "
                       aria-label="Linkedin">
                        <AiFillLinkedin size={23}/>
                    </a>}

                    {ENV.THEME.LINKEDIN_LINK && <a href={`${ENV.THEME.GITHUB_LINK}`}
                       className="mx-2 text-gray-600 transition-colors duration-300  hover:text-slate-900"
                       aria-label="Github">
                        <AiFillGithub size={23}/>
                    </a>}
                </div>
            </div>
        </footer>
    </div>
}
export default Footer