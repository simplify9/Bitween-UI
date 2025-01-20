interface Props {
    label: string
    value: string
    className?: string
}

const ExchangeProperty: React.FC<Props> = ({label, value, className}) => {
    if (!value) return <></>;
    return (
        <div className={"px-1.5 py-1 rounded-lg border " + className}><strong>{label}</strong>: {value}</div>
    )
}

export default ExchangeProperty;

