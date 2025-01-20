import {classes} from "./utils"
import React from "react";


type Props = React.JSX.IntrinsicElements['input'] & {}

const Component: React.FC<Props> = ({className, ...htmlProps}) => {
  return (
    <input {...htmlProps}
      value={htmlProps.value ?? ''}
           className={classes(
             className || "", "overflow-hidden text-sm  appearance-none block disabled:text-gray-400 disabled:shadow-none grow text-gray-700 focus:outline-none")}/>
  )
};

export default Component;