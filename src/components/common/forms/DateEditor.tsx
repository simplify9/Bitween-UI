import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, {forwardRef, useState} from "react";
import InputBox from "src/components/common/forms/InputBox";
import {BsFillCalendarFill} from "react-icons/bs";

// Custom input that matches the rest of the form fields — no react-datepicker CSS leaking
const DateInput = forwardRef<HTMLInputElement, React.JSX.IntrinsicElements['input']>(
    ({value, onClick, placeholder}, ref) => (
        <input
            ref={ref}
            readOnly
            value={value ?? ""}
            onClick={onClick}
            placeholder={placeholder ?? "Select date…"}
            className="text-sm appearance-none block grow text-gray-700 focus:outline-none bg-transparent cursor-pointer w-full placeholder-gray-400"
        />
    )
);

type Props = {
    value: string | undefined
    onChange: (val: string) => void
    minDate?: string | Date
    maxDate?: string | Date
}
const DateEditor: React.FC<Props> = ({value, onChange, minDate, maxDate}) => {
    const [open, setOpen] = useState(false);

    const onChangeDate = (date: Date | null) => {
        setOpen(false);
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const dateWithOffset = new Date(date.getTime() - offsetMs);
        onChange(dateWithOffset.toISOString());
    }
    const minDateObj = minDate ? new Date(minDate) : undefined;
    const maxDateObj = maxDate ? new Date(maxDate) : undefined;
    return (
        <InputBox className={"relative"}>
            <div className={"flex flex-row w-full justify-between items-center"}>
                <div className={"flex-1 min-w-0"}>
                    <DatePicker
                        selected={value ? new Date(value) : null}
                        minDate={minDateObj}
                        maxDate={maxDateObj}
                        open={open}
                        onInputClick={() => setOpen(true)}
                        onClickOutside={() => setOpen(false)}
                        portalId="datepicker-portal"
                        popperProps={{strategy: "fixed"}}
                        onChange={onChangeDate}
                        customInput={<DateInput />}
                        dateFormat="MMM d, yyyy"
                    />
                </div>
                <div onClick={() => setOpen(o => !o)} className="cursor-pointer flex-shrink-0">
                    <BsFillCalendarFill size={18} className={"text-primary-600"}/>
                </div>
            </div>
        </InputBox>
    )
}
export default DateEditor