import { classes } from "./utils"


type Props = JSX.IntrinsicElements['label'] & {
    title: string
}

const Component:React.FC<Props> = ({ title, children, className, ...htmlProps }) => (
    <label {...htmlProps} className={classes("mb-6 md:mb-0", className || "")}>
        <div className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            {title}
        </div>
        {children}
    </label>
);

export default Component;