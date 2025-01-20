import React, { JSX } from "react";
import {noOp} from "./utils"


type Props = Omit<React.JSX.IntrinsicElements['input'], "onChange"> & {
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

        <div className="flex flex-row items-center  mb-3 ">
            <div>
                <input type="checkbox" value="" checked={checked}
                       onClick={() => handleChange()}
                       onChange={() => {
                       }}
                       className="block w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300  "
                       required
                /></div>
            <div className="ml-2 t uppercase tracking-wide text-gray-700 text-xs font-bold  ">{label}</div>


        </div>

    );
};

export default Component;
