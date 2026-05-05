import Tooltip from "src/components/common/Tooltip";

interface Props {
    label: string
    value: string
    className?: string
}

const ExchangeProperty: React.FC<Props> = ({label, value, className}) => {
    if (!value) return <></>;
    return (
        <Tooltip content={`${label}: ${value}`} placement="top" className="block">
            <div className={"px-1.5 py-1 rounded-lg border max-w-[160px] truncate cursor-default " + className}><strong>{label}</strong>: {value}</div>
        </Tooltip>
    )
}

export default ExchangeProperty;

