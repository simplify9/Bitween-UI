import React from "react";

type ItemInfoProps = {
    icon: React.ReactNode
    title: string
    number: number
    color: string
}
const ItemInfo: React.FC<ItemInfoProps> = (props) => {

    return <div className={"flex flex-row items-center bg-white rounded-lg shadow px-3 py-5 "}>
        <div className={"bg-primary-200 flex items-center justify-center w-10 h-10 rounded-full p-1"}>
            {props.icon}
        </div>
        <div className={"mx-3"}>
            <span className={"text-xl font-semibold"}>
                    {props.number} 
            </span>

        </div>
        <div className={" text-gray-500"}>
            {props.title}
        </div>
    </div>
}
export default ItemInfo