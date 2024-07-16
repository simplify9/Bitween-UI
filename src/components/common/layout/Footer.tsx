import dayjs from "dayjs";
import {AiFillGithub, AiFillLinkedin} from "react-icons/ai";
import React from "react";
import {useTypedSelector} from "src/state/ReduxSotre";

const Footer = () => {
    const theme = useTypedSelector(i => i.theme)

    return <div className={""}>
        <footer className="bg-white shadow-lg rounded-lg ">
            <div
                className="container flex flex-col items-center justify-between p-6 py-3 mx-auto space-y-4 sm:space-y-0 sm:flex-row">
                <div>
                    <p className="text-sm text-gray-600 d">{`${theme.companyName}`} {dayjs().year()} <a
                        className={"underline text-red-600 font-semibold"}
                        href={`${theme.websiteLink}`}>{`${theme.companyName}`}</a> {theme.allRightsReserved}</p>
                </div>
                <div className="flex -mx-2">

                    {theme.linkedinLink && <a href={`${theme.linkedinLink}`}
                       className="mx-2 text-gray-600 transition-colors duration-300  hover:text-blue-500 "
                       aria-label="Linkedin">
                        <AiFillLinkedin size={23}/>
                    </a>}

                    {theme.githubLink && <a href={`${theme.githubLink}`}
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