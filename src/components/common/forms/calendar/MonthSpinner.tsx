
import { Icon } from "../../icons"


const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

const handlePreviousYear = (month:number, year:number, onChange:any) => () => {
    if (onChange) onChange([month, year - 1]);
}

const handlePreviousMonth = (month:number, year:number, onChange:any) => () => {
    if (onChange) onChange(month < 1 ? [11, year - 1] : [month - 1, year]);
}

const handleNextYear = (month:number, year:number, onChange:any) => () => {
    if (onChange) onChange([month, year + 1]);
}

const handleNextMonth = (month:number, year:number, onChange:any) => () => {
    if (onChange) onChange(month > 10 ? [0, year + 1] : [month + 1, year]);
}

interface Props {
    month: number
    year: number
    onChange?: (value:[number, number]) => void
}

const Component = ({ month, year, onChange }:Props) => {
    

    
    return (
        <div className="flex">
            <button key="prevyear" onClick={handlePreviousYear(month, year, onChange)} type="button" className="px-2"><Icon shape="chevronDoubleLeft" className="h-2" /></button>
            <button key="prevmonth" onClick={handlePreviousMonth(month, year, onChange)} type="button" className="px-2"><Icon shape="chevronLeft" className="h-2" /></button>
            <div className="grow flex justify-center uppercase tracking-wide text-sm">{monthNames[month]} - {year}</div>
            <button key="nextmonth" onClick={handleNextMonth(month, year, onChange)} type="button" className="px-2"><Icon shape="chevronRight" className="h-2" /></button>
            <button key="nextyear" onClick={handleNextYear(month, year, onChange)} type="button" className="px-2"><Icon shape="chevronDoubleRight" className="h-2" /></button>
        </div>
    )
}

export default Component;