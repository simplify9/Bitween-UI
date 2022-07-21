import React, {ChangeEventHandler} from "react";
import Input from "./Input";
import InputBox from "./InputBox";
import {classes, noOp} from "./utils"


type Props = Omit<JSX.IntrinsicElements['input'], "onChange"> & {
  onChange?: (value: string) => void

}

const Component: React.FC<Props> = ({
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
    <InputBox className={classes("", className)}>
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

export default Component;
