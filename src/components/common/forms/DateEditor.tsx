import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import InputBox from "src/components/common/forms/InputBox";
import {BsFillCalendarFill} from "react-icons/bs";

type Props = {
    value: string | undefined
    onChange: (val: string) => void
}
const DateEditor: React.FC<Props> = ({value, onChange}) => {
    const onChangeDate = (date: Date | null) => {

        const offsetMs = date.getTimezoneOffset() * 60 * 1000; // Convert offset to milliseconds
        const dateWithOffset = new Date(date.getTime() - offsetMs); // Apply offset to create new date object
        const isoString = dateWithOffset.toISOString(); // Convert to ISO string
        console.log("x",isoString)
        onChange(isoString);
    }
    return (
        <InputBox className={"relative  z-50"}>
            <div className={"flex flex-row justify-between items-center"}>
                <div className={"pr-1"}>
                    <DatePicker

                        className={"relative  "}
                        selected={value ? new Date(value) : null}
                        onChange={onChangeDate}/>
                </div>
                <div>
                    <BsFillCalendarFill size={21} className={"text-primary-600 "}/>
                </div>
            </div>


        </InputBox>

    )
}
export default DateEditor