interface Props {
    label: string
    value: string
    className?: string
}

const ExchangeProperty: React.FC<Props> = ({label, value, className}) => {
    if (!value) return <></>;
    return (
        <div className={"px-2 py-1 rounded-full border " + className ?? ''}><strong>{label}</strong>: {value}</div>
    )
}

export default ExchangeProperty;

