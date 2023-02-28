import React from "react";
import {AiFillFile} from "react-icons/ai";

type Props = {
    completed: boolean,
    error?: boolean,
    bad?: boolean,
    onClick?: () => void,
    fileKey: string | undefined
    type: string
}
const Pipe: React.FC<Props> = ({completed, error, onClick, bad, fileKey, type}) => {

    const color = `${bad ? "bg-yellow-400" : error ? " bg-red-400 " : completed ? " bg-teal-400 " : " bg-gray-400 "}`
    return <div

        className={`h-2  relative flex items-center justify-center ${color} w-full rounded-full -mx-2 z-0 `}>

        {
            fileKey &&
            <div title={type}
                 key={`${fileKey}_${type}`} onClick={onClick}
                 className={`absolute left-1/3 flex items-center justify-center rounded-full p-1 ${onClick ? "cursor-pointer" : ""} w-7 h-7 ${color}`}>
                <AiFillFile size={16} className={"text-white "}/>
            </div>
        }

    </div>
}

export default Pipe