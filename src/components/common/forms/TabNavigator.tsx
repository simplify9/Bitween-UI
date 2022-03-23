import { classes } from "./utils"


type Props = JSX.IntrinsicElements['div'] & {

}

const Component:React.FC<Props> = ({ className = "", children, ...htmlProps }) => (
    <div {...htmlProps} className={classes("flex w-full shadow-b-2 shadow-gray-200", className)}>
        {children}
    </div>
);

export default Component;