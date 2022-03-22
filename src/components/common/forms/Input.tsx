import { classes } from "./utils"


type Props = JSX.IntrinsicElements['input'] & {

}

const Component:React.FC<Props> = ({ className, ...htmlProps }) => (
    <input {...htmlProps} className={classes("appearance-none block grow text-gray-700 focus:outline-none", className || "")} />
);

export default Component;