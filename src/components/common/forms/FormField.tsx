import {classes} from "./utils"
import React from "react";
import Button from "src/components/common/forms/Button";
import FieldTooltip from "src/components/common/forms/FieldTooltip";


type Props = React.JSX.IntrinsicElements['div'] & {
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
    // Deliberately a <div>, not a <label>: FormField wraps arbitrary, often multi-control
    // content (tables of rows with their own buttons, nested editors, etc.). A native
    // <label> auto-forwards any click within it to the first labelable descendant, which
    // silently triggers that control's own handler (e.g. a "remove row" button) whenever
    // something else inside the field is clicked. See MatchersEditor bug: clicking the
    // matcher-type dropdown after adding one matcher also fired the remove button because
    // it was the first <button> inside the label.
    <div {...htmlProps} className={classes("mb-6 md:mb-0", className || "")}>
        <div
            className="focus-within:z-[500000] uppercase tracking-wide text-gray-700 text-xs font-bold mb-1 flex flex-row justify-between">
            <span className="inline-flex items-center min-w-0">
                <span className="truncate">{title}</span>
                {tooltip && <FieldTooltip content={tooltip}/>}
            </span>
            {
                onClickAction && <Button variant={"none"}
                                         onClick={onClickAction}>{actionTitle}</Button>
            }

        </div>

        {children}
    </div>
);

export default Component;