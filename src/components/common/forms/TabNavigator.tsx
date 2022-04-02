import { classes } from "./utils"


type Props = JSX.IntrinsicElements['div'] & {

}

const Component:React.FC<Props> = ({ className = "", children, ...htmlProps }) => (
    <div {...htmlProps} className={classes("z-10 flex border-b border-gray-300 relative", className)}>
        {children}
    </div>
);

export default Component;