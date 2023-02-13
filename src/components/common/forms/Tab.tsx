import {classes} from "./utils"


type Props = JSX.IntrinsicElements['div'] & {
    selected?: boolean
}

const ownCss = (selected: boolean) => {
    return selected
        ? "flex items-center first:ml-0 ml-4 py-1 px-1 first:pl-0 text-sm shadow-b-2 shadow-blue-400 cursor-default"
        : "flex items-center first:ml-0 ml-4 py-1 px-1 first:pl-0 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer";
}

const Component: React.FC<Props> = ({selected, className = "", children, ...htmlProps}) => (
    <div {...htmlProps} className={classes(ownCss(!!selected), className)}>
        {children}
    </div>
);

export default Component;