import React, {Fragment, useState} from "react";
import ExchangeDocument from "src/components/exchanges/ExchangeDocument";
import ExchangeDocumentModal from "src/components/exchanges/ExchangeDocumentModal";
import {ExchangeDisplayStatus} from "src/types/xchange";
import Pipe from "src/components/exchanges/ExchangeDataPipe";

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
            <ExchangeDocumentModal downloadUrl={downloadUrl!} name={downloadUrl} onClose={() => setDownloadUrl(null)}/>
        }
        <div className={"flex flex row justify-between items-center "}>


            <ExchangeDocument status={"good"} type={"receiver"}/>
            <Pipe type={"Input"} onClick={() => setDownloadUrl(inputKey)} fileKey={inputKey} completed={true}/>


            <ExchangeDocument status={getMapperStatus()} type={mapperId ? "mapper" : "skipped"}/>
            <Pipe type={"Mapper output"} fileKey={outputKey} onClick={() => setDownloadUrl(outputKey)}
                  error={Boolean(mapperId) && Boolean(failed) && !outputKey}
                  completed={!mapperId || Boolean(outputKey)}/>


            <ExchangeDocument status={getHandlerStatus()} type={"handler"}/>
            <Pipe type={"Response"} fileKey={responseKey} onClick={() => setDownloadUrl(responseKey)}
                  completed={status || Boolean(responseKey)}
                  bad={Boolean(responseBad)}

                  error={failed}/>


        </div>
    </Fragment>
}
export default React.memo(ExchangeJourney)