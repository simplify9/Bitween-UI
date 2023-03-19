import {classes} from "./utils";
import React from "react";

type Props = {
    onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void,
    disabled?: boolean,
    children: React.ReactNode,
    variant?: "primary" | "secondary" | "none"
    className?: string
}

const Button: React.FC<Props> = ({

                                     children,
                                     onClick,
                                     variant = "primary",
                                     className
                                 }) => {

    const getVariant = (variant: "primary" | "secondary" | "none") => {

        switch (variant) {
            case "primary":
                return "text-white min-w-[80px] grow min-h-[30px] m-1  bg-primary-600 shadow-md  px-2 text-md  rounded  hover:scale-110 hover:bg-primary-500 transition ease-in-out delay-100 "
            case "secondary":
                return "text-white min-w-[80px] grow bg-slate-800 m-1 shadow-md  px-3 text-md rounded  hover:scale-110 hover:bg-slate-600 transition ease-in-out delay-100"
            case "none":
                return " "

        }
    }

    return (
        <button onClick={(event) => {
            event.stopPropagation();
            event.preventDefault()
            onClick(event)
        }}
                className={classes("cursor-pointer flex text-center flex items-center justify-center ", className ?? "", getVariant(variant))}>
            {children}
        </button>
    )

}

export default Button;