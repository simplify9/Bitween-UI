import React from "react";
import {IoEnterOutline, IoExitOutline} from "react-icons/io5"
import {TbRectangleVertical} from "react-icons/tb"
import {MdTransform} from "react-icons/md"
import {ExchangeDisplayStatus, ExchangeDisplayType} from "src/types/xchange";


interface Props {
    type: ExchangeDisplayType
    status: ExchangeDisplayStatus
}

const ExchangeDocument: React.FC<Props> = ({type, status}) => {

    const getIconClasses = () => {
        if (status == "good") {
            return "text-teal-600"
        }
        if (status == "bad") {
            return "text-rose-600"
        }
        if (status == "pending") {
            return "text-gray-400"
        }
    }
    const getContainerClasses = () => {
        if (status == "good") {
            return "bg-teal-100"
        }
        if (status == "bad") {
            return "bg-rose-100"
        }
        if (status == "pending") {
            return "bg-gray-100"
        }
    }
    return (

        <div className={" z-20  bg-grey-400 text-grey-700 rounded-full shadow-lg " + getContainerClasses()}>
            <div
                className={"flex     items-center justify-center  h-12 w-12 "}>
                {
                    type == "receiver" && <IoEnterOutline className={"w-6 h-6 " + getIconClasses()}/>
                }
                {
                    type == "mapper" && <MdTransform className={"w-5 h-5 " + getIconClasses()}/>
                }
                {
                    type == "skipped" && <TbRectangleVertical className={"w-5 h-5 " + getIconClasses()}/>
                }
                {
                    type == "handler" && <IoExitOutline className={"w-6 h-6 " + getIconClasses()}/>
                }
            </div>
        </div>

    );
}

export default ExchangeDocument;
