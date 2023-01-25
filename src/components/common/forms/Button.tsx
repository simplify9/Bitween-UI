import {classes} from "./utils";
import React from "react";

type Props = JSX.IntrinsicElements['button'] & { onClick: () => void }

const Component: React.FC<Props> = ({
                                      className = "",
                                      children,
                                      onClick,
                                      ...htmlProps
                                    }) => {

  return (
    <button {...htmlProps} onClick={(event)=> {
        event.stopPropagation();
        onClick()
    }} className={classes("", className)}>
      {children}
    </button>
  )

}

export default Component;