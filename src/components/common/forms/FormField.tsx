import {classes} from "./utils"
import React from "react";
import Button from "src/components/common/forms/Button";


type Props = React.JSX.IntrinsicElements['label'] & {
    title: string
    actionTitle?: string | React.JSX.Element
    onClickAction?: () => void
}

const Component: React.FC<Props> = ({
                                        title,
                                        children,
                                        className,
                                        onClickAction,
                                        actionTitle,
                                        ...htmlProps
                                    }) => (
    <label {...htmlProps} className={classes("mb-6 md:mb-1", className || "")}>
        <div
            className="min-w-[242px] focus-within:z-[500000]  overflow-hidden  uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-row justify-between">
            {title}
            {
                onClickAction && <Button variant={"none"}
                                         onClick={onClickAction}>{actionTitle}</Button>
            }

        </div>

        {children}
    </label>
);

export default Component;