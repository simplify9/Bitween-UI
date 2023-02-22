import React from "react";
import {noOp} from "./utils"


type Props = Omit<JSX.IntrinsicElements['input'], "onChange"> & {
    onChange?: (value: boolean) => void
    checked?: boolean
    label?: string
}

const Component: React.FC<Props> = ({
                                        className = "",
                                        placeholder,
                                        disabled,
                                        value,
                                        label,
                                        checked,
                                        onChange = noOp,
                                        onFocus,
                                        onBlur,
                                        ...htmlProps
                                    }) => {

    const handleChange = () => {
        onChange(!checked);
    }

    return (

        <div className="flex flex-row items-center  mb-3">

            <input type="checkbox" value="" checked={checked}
                   onClick={() => handleChange()}
                   onChange={() => {
                   }}
                   className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                   required/>
            <label className="ml-2 text-sm font-medium  ">{label}</label>


        </div>

    );
};

export default Component;
