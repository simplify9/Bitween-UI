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
    <button {...htmlProps} onClick={onClick} className={classes("", className)}>
      {children}
    </button>
  )

}

export default Component;