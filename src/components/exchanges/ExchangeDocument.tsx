import { DocumentType } from "../../entityModel";


interface Props {
    type: DocumentType
    downloadUrl?: string
    promotedProps?: object
}

const ExchangeDocument:React.FC<Props> = ({ type, downloadUrl, promotedProps = {} }) => {

    return (
        <div className="flex flex-col w-full space-y-2">
            <div className="font-medium text-left flex">
                <div>{type.desc}</div>
                <div className="grow" />
                <button className=" border bg-gray-50 px-3 rounded shadow-sm">Download Input</button>
            </div>
            <div className="flex flex-row flex-nowrap space-x-3 py-2  px-2 border-t">{
                Object.entries(promotedProps)
                    .map(([key, value]) => (
                        <div className="flex flex-col space-y-1" key={key}>
                            <div key="k" className="text-left text-xs">{key}</div>
                            <div key="v" className="text-left font-medium">{value}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default ExchangeDocument;