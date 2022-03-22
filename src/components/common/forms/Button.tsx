import { classes } from "./utils";

type Props = JSX.IntrinsicElements['button'] & {
    
}

const Component:React.FC<Props> = ({ className, children, ...htmlProps }) => {

    return (
        <button {...htmlProps} className={classes("", className || "")}>
            {children}
        </button>
    )

}

export default Component;