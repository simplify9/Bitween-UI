import {getDate} from "date-fns";

interface Props {
    date: Date
    selected: boolean
    onSelect: (value: Date) => void
}

const Component = ({date, selected, onSelect}: Props) => {

    const handleClick = () => {
        onSelect(date);
    }

    return (
        <div
            className={"text-xs p-1" + (selected ? " bg-blue-900 text-white cursor-default" : " cursor-pointer hover:bg-gray-100")}
            onClick={handleClick}>{getDate(date)}</div>
    );
}

export default Component;