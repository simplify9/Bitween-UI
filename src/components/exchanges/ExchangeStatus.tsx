

interface Props {
    status: string
}

const ExchangeStatus:React.FC<Props> = ({ status }) => {

    return (
        <div>{status}</div>
    )
}

export default ExchangeStatus;

