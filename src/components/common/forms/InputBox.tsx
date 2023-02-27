import {classes} from "./utils";
import React from "react";


type Props = JSX.IntrinsicElements['div'] & {
    withPopOver?: boolean
}

const ownCss = (withPopOver: boolean) => (
    `overflow-hidden flex flex-nowrap relative bg-white group py-2 px-4 focus-within:drop-shadow-md  disabled:shadow-none transition border-gray-300 rounded-t rounded-b border-x border-t border-b ${withPopOver && "focus-within:z-30 focus-within:rounded-b-none focus-within:border-b-none"} drop-shadow-sm  overflow-visible`
);

const Component: React.FC<Props> = ({
                                        withPopOver,
                                        children,
                                        className,
                                        ...htmlProps
                                    }) => (
    <div {...htmlProps}
         className={classes(ownCss(!!withPopOver), className || " z-10 relative")}>
        {children}
        {withPopOver &&
            <div
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                    className="-rotate-90 group-focus-within:rotate-0 fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path
                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>}
    </div>
);

export default React.memo(Component);
