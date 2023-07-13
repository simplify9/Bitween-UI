import React, {Fragment} from "react";

type Props = {
    completed: boolean,
    error?: boolean,
    bad?: boolean,
    onClick?: () => void,
    fileKey: string | undefined
    type: string
}
const Pipe: React.FC<Props> = ({completed, error, onClick, bad, fileKey, type}) => {

    const color = `${bad ? "bg-yellow-400" : error ? " bg-red-400 " : completed ? " bg-primary-green " : " bg-gray-400 "}`
    return <Fragment

    >
        {
            fileKey &&
            <div title={type}
                 key={`${fileKey}_${type}`} onClick={onClick}
                 className={` ${onClick ? "cursor-pointer" : ""} flex justify-center items-center rounded p-1 w-6 h-6 ${color} `}>
                <img src={"/Icons/document-white.svg"} color={'white'} className={"h-5 text-white"}/>
            </div>
        }

    </Fragment>
}

export default Pipe