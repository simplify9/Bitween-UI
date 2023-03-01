import {classes} from "./utils"


type Props = JSX.IntrinsicElements['div'] & {
    selected?: boolean
}

const Component: React.FC<Props> = ({className = "", title, children, selected, ...htmlProps}) => (
    <div {...htmlProps}
         className={classes("py-2 px-2 flex whitespace-nowrap items-center text-sm ", selected ? "text-black font-medium cursor-default" : "text-black cursor-pointer hover:bg-gray-100", className)}>
        {children}
    </div>
);

export default Component;