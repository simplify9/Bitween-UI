import {classes} from "./utils"
import React from "react";


type Props = JSX.IntrinsicElements['div'] & {}

const Component: React.FC<Props> = ({children, className, ...htmlProps}) => (
    <div {...htmlProps} onClick={(e) => {
        e.preventDefault()
        // @ts-ignore
        document.activeElement?.blur?.()
    }} onMouseDown={(e) => {
        e.preventDefault()

    }}
         className={classes("focus-within:z-30 absolute bg-white top-full border-gray-300 border-x border-b rounded-b invisible group-focus-within:visible ", className || "")}
         style={{left: -1, right: -1}}>
    <span>
    {children}
      </span>
    </div>
);

export default Component;
