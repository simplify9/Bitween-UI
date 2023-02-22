import MonthSpinner from "./MonthSpinner";
import MonthView from "./MonthView";


interface Props {
    value?: Date
    activeMonth: number
    activeYear: number
    firstDayOfWeek?: number
    onChange?: (value: Date) => void
    onActiveMonthChange?: (value: [number, number]) => void
}

const Component: React.FC<Props> = ({
                                        firstDayOfWeek = 0,
                                        value,
                                        activeMonth,
                                        activeYear,
                                        onChange,
                                        onActiveMonthChange
                                    }: Props) => {

    return (
        <div className="grow flex flex-col p-2">
            <MonthSpinner month={activeMonth} year={activeYear} onChange={onActiveMonthChange}/>
            <MonthView value={value} firstDayOfWeek={firstDayOfWeek} activeMonth={activeMonth} activeYear={activeYear}
                       onChange={onChange}/>
        </div>
    );
}

export default Component;