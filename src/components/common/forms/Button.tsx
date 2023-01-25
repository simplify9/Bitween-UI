import {classes} from "./utils";
import React from "react";

type Props = JSX.IntrinsicElements['div'] & { onClick: () => void, disabled?: boolean }

const Component: React.FC<Props> = ({
                                        className = "",
                                        children,
                                        onClick,
                                        ...htmlProps
                                    }) => {

    return (
        <div {...htmlProps} onClick={(event) => {
            event.stopPropagation();
            onClick()
        }} className={classes("", className)}>
            {children}
        </div>
    )

}

export default Component;