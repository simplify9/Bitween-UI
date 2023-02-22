import {format, getMonth, getYear, isValid, parse} from "date-fns";
import React, {useState} from "react";
import Calendar from "./calendar/Calendar";
import Input from "./Input";
import InputBox from "./InputBox";
import InputPopOver from "./InputPopOver";
import {noOp} from "./utils";


export type DateTimeRange = {
    from?: string
    to?: string
}

interface CalendarState {
    month: number
    year: number
}

interface State {
    from: CalendarState
    to: CalendarState
}

interface Props {
    dateTimeFormat?: string
    value?: DateTimeRange
    onChange?: (newValue: DateTimeRange) => void
}

const getCalendarState = (rawValue: string | undefined, dateTimeFormat: string) => {
    const today = new Date();
    const date = rawValue ? parse(rawValue, dateTimeFormat, new Date()) : null;
    return {
        month: getMonth(date || today),
        year: getYear(date || today)
    };
}

const getCalendarValue = (rawValue: string | undefined, dateTimeFormat: string) => {
    if (!rawValue) return undefined;
    const asDate = parse(rawValue, dateTimeFormat, new Date());
    if (isValid(asDate)) return asDate;
    return undefined;
}

export const DateTimeRangeEditor: React.FC<Props> = ({value = {}, onChange = noOp, dateTimeFormat = "dd-MM-yyyy"}) => {

    const {from, to} = value;

    const [state, setState] = useState<State>({
        from: getCalendarState(from, dateTimeFormat),
        to: getCalendarState(to, dateTimeFormat)
    });

    const handleFocus = () => {
        setState(s => ({
            ...s,
            from: getCalendarState(from, dateTimeFormat),
            to: getCalendarState(to, dateTimeFormat)
        }));
    };

    const handleFromMonthChange = (monthYear: [number, number]) => {
        setState(s => ({
            ...s,
            from: {
                month: monthYear[0],
                year: monthYear[1]
            }
        }))
    }

    const handleToMonthChange = (monthYear: [number, number]) => {
        setState(s => ({
            ...s,
            to: {
                month: monthYear[0],
                year: monthYear[1]
            }
        }))
    }

    const handleTextBoxFromChange = (e: any) => {
        onChange({from: e.target.value, to});
    }

    const handleTextBoxToChange = (e: any) => {
        onChange({from, to: e.target.value});
    }

    const handleCalendarFromChange = (date: Date) => {
        onChange({from: format(date, dateTimeFormat), to});
    }

    const handleCalendarToChange = (date: Date) => {
        onChange({from, to: format(date, dateTimeFormat)});
    }

    return (
        <InputBox className="hidden md:flex" withPopOver onFocus={handleFocus}>

            <div className="text-gray-400 px-2">From</div>
            <Input type="text" placeholder="dd-mm-yyyy" value={from || ""} onChange={handleTextBoxFromChange}/>

            <div className="text-gray-400 px-2">To</div>
            <Input type="text" placeholder="dd-mm-yyyy" value={to || ""} onChange={handleTextBoxToChange}/>

            <InputPopOver>
                <div className="flex w-full divide-x">
                    <Calendar
                        key="from"
                        activeMonth={state.from.month}
                        activeYear={state.from.year}
                        onActiveMonthChange={handleFromMonthChange}
                        value={getCalendarValue(from, dateTimeFormat)}
                        onChange={handleCalendarFromChange}/>
                    <Calendar
                        key="to"
                        activeMonth={state.to.month}
                        activeYear={state.to.year}
                        onActiveMonthChange={handleToMonthChange}
                        value={getCalendarValue(to, dateTimeFormat)}
                        onChange={handleCalendarToChange}/>
                </div>
            </InputPopOver>

        </InputBox>
    )

}

