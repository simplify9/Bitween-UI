import {classes} from "./utils"
import React from "react";
import Button from "src/components/common/forms/Button";


type Props = JSX.IntrinsicElements['label'] & {
  title: string
  actionTitle?: string
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
      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 flex flex-row justify-between">
      {title}
      {
        onClickAction && <Button className={"bg-blue-600 rounded w-5 h-5 mr-1"}
                                 onClick={onClickAction}>{actionTitle}</Button>
      }

    </div>

    {children}
  </label>
);

export default Component;