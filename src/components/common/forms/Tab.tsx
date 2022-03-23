import { classes } from "./utils"


type Props = JSX.IntrinsicElements['div'] & {
    selected?: boolean
}

const ownCss = (selected: boolean) => {
    return selected
        ? "first:ml-0 ml-4 py-1 text-sm font-medium shadow-b-2 shadow-teal-500 cursor-default"
        : "first:ml-0 ml-4 py-1 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer";
}

const Component:React.FC<Props> = ({ selected, className = "", children, ...htmlProps }) => (
    <div {...htmlProps} className={classes(ownCss(!!selected), className)}>
        {children}
    </div>
);

export default Component;