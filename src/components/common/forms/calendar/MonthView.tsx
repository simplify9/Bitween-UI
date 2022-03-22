import { getDay, getDaysInMonth, isSameDay, startOfMonth } from "date-fns"
import DayView from "./DayView";


// Sunday = 0 | 1 | 2 | 3 | 4 | 5 | 6
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    firstDayOfWeek: number
    activeMonth: number
    activeYear: number
    value?: Date
    onChange?: (value: Date) => void
}

const Component = ({ activeMonth, activeYear, value, onChange, firstDayOfWeek }: Props) => {


    const firstDay = startOfMonth(new Date(activeYear, activeMonth));
    const firstMonthDay = getDay(firstDay);

    let weekIndices = [];
    for (let i = 0, j = firstDayOfWeek; i < 7; ++i) {
        weekIndices.push(j++);
        if (j > 6) j = 0;
    }

    let monthDays = [];
    for (const i of weekIndices) {
        if (firstMonthDay === i) break;
        monthDays.push(null);
    }

    const totalDays = getDaysInMonth(new Date(activeYear, activeMonth));
    for (let dayInMonth = 1; dayInMonth <= totalDays; ++dayInMonth) {
        monthDays.push(new Date(activeYear, activeMonth, dayInMonth));
    }

    for (let i = 0; i < monthDays.length % 7; ++i) {
        monthDays.push(null);
    }

    let weeks = [];
    while (monthDays.length > 0) {
        weeks.push(monthDays.splice(0, 7));
    }

    const handleSelectDay = (date:Date) => {
        if (onChange) onChange(date);
    }

    return (
        <table>
            <thead>
                <tr>
                    {weekIndices.map(wd => (<th key={wd} className="p-1 text-xs font-light">{weekDays[wd]}</th>))}
                </tr>
            </thead>
            <tbody>
                {weeks.map((w,i) => (
                    <tr key={i}>
                        {w.map((date,j) => (
                            <td key={(date || j).toString()} className="overflow-visible">
                                {
                                    date 
                                    ? <DayView 
                                        date={date} 
                                        selected={!!value && isSameDay(value, date)}
                                        onSelect={handleSelectDay} />
                                    : <div />
                                }
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Component;