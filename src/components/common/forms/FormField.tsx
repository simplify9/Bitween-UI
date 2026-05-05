import {classes} from "./utils"
import React from "react";
import Button from "src/components/common/forms/Button";
import Tooltip from "src/components/common/Tooltip";


type Props = React.JSX.IntrinsicElements['label'] & {
    title: string
    tooltip?: string
    actionTitle?: string | React.JSX.Element
    onClickAction?: () => void
}

const Component: React.FC<Props> = ({
                                        title,
                                        tooltip,
                                        children,
                                        className,
                                        onClickAction,
                                        actionTitle,
                                        ...htmlProps
                                    }) => (
    <label {...htmlProps} className={classes("mb-6 md:mb-0", className || "")}>
        <div
            className="focus-within:z-[500000] overflow-hidden uppercase tracking-wide text-gray-700 text-xs font-bold mb-1 flex flex-row justify-between">
            {tooltip ? (
                <Tooltip content={tooltip} placement="bottom">
                    <span className="cursor-help">{title}</span>
                </Tooltip>
            ) : title}
            {
                onClickAction && <Button variant={"none"}
                                         onClick={onClickAction}>{actionTitle}</Button>
            }

        </div>

        {children}
    </label>
);

export default Component;