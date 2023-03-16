import {classes} from "./utils"
import React from "react";
import Button from "src/components/common/forms/Button";


type Props = JSX.IntrinsicElements['label'] & {
    title: string
    actionTitle?: string | JSX.Element
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
    <label {...htmlProps} className={classes("mb-6 md:mb-0", className || "")}>
        <div
            className="block uppercase overflow-hidden tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-row justify-between z-10">
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