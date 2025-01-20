import React, {ChangeEventHandler} from "react";
import Input from "./Input";
import InputBox from "./InputBox";
import {classes, noOp} from "./utils"


type Props = Omit<React.JSX.IntrinsicElements['input'], "onChange"> & {
    onChange?: (value: string) => void

}

const TextEditor: React.FC<Props> = ({
                                                   className = "",
                                                   placeholder,
                                                   disabled,
                                                   value,
                                                   onChange = noOp,
                                                   onFocus,
                                                   onBlur,
                                                   ...htmlProps
                                               }) => {

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        onChange(e.target.value);
    }

    return (
        <InputBox className={classes("overflow-hidden", className)}>
            <Input
                type="text"
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={handleChange}
                {...htmlProps}
            />
        </InputBox>
    );
};

export default TextEditor;
