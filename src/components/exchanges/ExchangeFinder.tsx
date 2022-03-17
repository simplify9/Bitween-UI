
interface SearchParams {
    q: string
    subscriptionId: string
}

interface Props {
    onChange: (value:SearchParams) => void
    params: Partial<SearchParams>
}


export default ({ params, onChange }: Props) => (
    <div>
        <p>Criteria:</p>
        <p>q: {params.q}</p>
        <p>subscriptionId: {params.subscriptionId}</p>
    </div>
)