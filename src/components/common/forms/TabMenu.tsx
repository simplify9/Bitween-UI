import {Icon} from "../icons";
import {classes} from "./utils"


type Props = JSX.IntrinsicElements['div'] & {}

const Component: React.FC<Props> = ({className = "", title, children, ...htmlProps}) => (
    <div {...htmlProps}
         className={classes("flex flex-nowrap items-center  first:ml-0 ml-4 text-sm font-light text-gray-400 group focus-within:shadow-b-2 focus-within:shadow-blue-400 focus-within:hover:shadow-blue-400 focus-within:hover:text-gray-400 hover:text-gray-500 hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer", className)}>
        <button className="focus:outline-none flex flex-nowrap items-center py-1 px-2 focus-within:text-black">{title}
            <Icon shape="chevronRight" className="h-2 ml-2 rotate-90"/></button>
        <div
            className="flex absolute top-full min-w-full right-0 pt-1 invisible group-focus-within:visible border-x border-b rounded-b drop-shadow-md"
            onMouseDown={(e) => e.preventDefault()}>
            <div className="bg-white flex flex-col divide-y w-full">
                {children}
            </div>
        </div>
    </div>
);

export default Component;