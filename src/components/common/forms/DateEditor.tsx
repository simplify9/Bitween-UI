import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import InputBox from "src/components/common/forms/InputBox";


type Props = {
    value: string | undefined
    onChange: (val: string) => void
}
const DateEditor: React.FC<Props> = ({value, onChange}) => {

    const onChangeDate = (date: Date | null) => {
        if (date) {
            onChange(date?.toISOString())
        }
    }
    return (
        <InputBox className={"relative  z-50"}>
            <DatePicker  className={"relative z-50"} selected={value ? new Date(value) : null} onChange={onChangeDate}/>
        </InputBox>

    )
}
export default DateEditor