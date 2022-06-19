

interface Props {
    label: string
    value:string
}

const ExchangeProperty:React.FC<Props> = ({ label,value }) => {

    return (
        <div>{label}: {value}</div>
    )
}

export default ExchangeProperty;

