import React, {Fragment, useState} from "react";
import ExchangeDocument from "src/components/exchanges/ExchangeDocument";
import ExchangeDocumentModal from "src/components/exchanges/ExchangeDocumentModal";
import {ExchangeDisplayStatus} from "src/types/xchange";
import {AiFillFile} from 'react-icons/ai'

type Props = {
    inputKey: string
    outputKey: string
    responseKey: string
    responseBad: boolean | null
    mapperId: string | null
    outputBad: boolean | null
    failed: boolean
    status: boolean | null
}

type PipeProps = { completed: boolean, error?: boolean, bad?: boolean, onClick?: () => void, fileKey: string | undefined }
const Pipe: React.FC<PipeProps> = ({completed, error, onClick, bad, fileKey}) => {

    const color = `${bad ? "bg-yellow-500" : error ? " bg-red-400 " : completed ? " bg-blue-600 " : " bg-gray-400 "}`
    return <div
        onClick={onClick}
        className={`h-2 relative flex items-center justify-center ${color}  w-full rounded-full -mx-2 -z-5 ${onClick ? "cursor-pointer" : ""}`}>

        {
            fileKey &&
            <div className={`absolute left-1/3 flex items-center justify-center rounded-full p-1  w-7 h-7 ${color}`}>
                <AiFillFile size={16} className={"text-white "}/></div>
        }

    </div>
}
const ExchangeJourney: React.FC<Props> = (
    {
        inputKey,
        outputKey,
        responseKey,
        responseBad,
        mapperId,
        outputBad,
        failed,
        status
    }
) => {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);


    const getHandlerStatus = (): ExchangeDisplayStatus => {

        if (status) {
            return "good"
        }
        if (failed) {
            return "bad"
        }
        if (failed && !outputKey) {
            return "bad"
        }
        if (!responseKey && !responseBad) {
            return "pending"
        }


        return "good"
    }
    const getMapperStatus = (): ExchangeDisplayStatus => {


        if (!mapperId || !outputKey) {
            return "pending"
        }
        if (failed && !outputKey) {
            return "bad"
        }


        return "good"
    }

    return <Fragment>
        {
            Boolean(downloadUrl) &&
            <ExchangeDocumentModal downloadUrl={downloadUrl!} name={"File"} onClose={() => setDownloadUrl(null)}/>
        }
        <div className={"flex flex row justify-between items-center "}>


            <ExchangeDocument status={"good"} type={"receiver"}/>
            <Pipe onClick={() => setDownloadUrl(inputKey)} fileKey={inputKey} completed={true}/>


            <ExchangeDocument status={getMapperStatus()} type={mapperId ? "mapper" : "skipped"}/>
            <Pipe fileKey={outputKey} onClick={() => setDownloadUrl(outputKey)}
                  error={Boolean(mapperId) && Boolean(failed) && !outputKey}
                  completed={!mapperId || Boolean(outputKey)}/>


            <ExchangeDocument status={getHandlerStatus()} type={"handler"}/>
            <Pipe fileKey={responseKey} onClick={() => setDownloadUrl(responseKey)}
                  completed={status || Boolean(responseKey)}
                  bad={Boolean(responseBad)}
                  error={failed}/>


        </div>
    </Fragment>
}
export default ExchangeJourney