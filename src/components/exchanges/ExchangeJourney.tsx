import React from "react";
import ExchangeDocument from "src/components/exchanges/ExchangeDocument";
import {ExchangeDisplayStatus} from "src/types/xchange";
import {getDateDifferenceHumanized} from "src/utils/DateUtils";
import dayjs from "dayjs";

type Props = {
    inputKey: string
    outputKey: string
    responseKey: string
    responseBad: boolean | null
    mapperId: string | null
    outputBad: boolean | null
    failed: boolean
    status: boolean | null
    finishedOn: string
    startedOn: string
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
        status,
        startedOn,
        finishedOn
    }
) => {


    const getHandlerStatus = (): ExchangeDisplayStatus => {

        console.log(failed, !outputKey, status, responseBad, responseKey)

        // if (failed) {
        //     console.log(2)
        //     return "bad"
        // }
        if (responseBad) {
            console.log(3)

            return "bad"
        }
        if (status === true) {
            console.log(1)
            return "good"
        }
        if (!responseKey && !responseBad) {
            console.log(4)
            return "error"
        }


        return "good"
    }

    const getLineColor = (k: string) => {
        switch (k) {
            case "good":
                return "bg-primary-green "
            case "pending":
                return "bg-gray-400 "
            case "bad":
                return "bg-yellow-400 "
            case "error":
                return "bg-red-500 "
        }
    }
    const getFooterColor = (k: string) => {
        switch (k) {
            case "good":
                return "bg-green-100"
            case "pending":
                return "bg-gray-100"
            case "bad":
                return "bg-yellow-100 "
            case "error":
                return "bg-red-100 "
        }
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

    return <div className={"bg-white border rounded-lg overflow-hidden flex flex-col  "}>


        <div className={"flex flex-row  "}>
            <div className={"w-1/3  rounded-bl-xl  "}>
                <div className={`${getLineColor('good')} h-6 rounded-l-lg  mt-1 ml-1`}>

                </div>
                <div className={"border-r py-1 "}>
                    <ExchangeDocument error={false} fileKey={inputKey} title={"Input"} completed={true} status={"good"}
                                      type={"receiver"}/>
                </div>
            </div>
            <div className={"w-1/3  "}>
                <div className={` ${getLineColor(getMapperStatus())} h-6 text-center  mt-1 `}>
                    {!mapperId && <span className={"text-xs text-white"}>Skipped</span>}
                </div>
                <div className={"border-r py-1 "}>
                    <ExchangeDocument error={Boolean(mapperId) && Boolean(failed) && !outputKey}
                                      completed={!mapperId || Boolean(outputKey)} fileKey={outputKey} title={"Mapping"}
                                      status={getMapperStatus()}
                                      type={mapperId ? "mapper" : "skipped"}/>
                </div>

            </div>
            <div className={"w-1/3   "}>
                <div className={` h-6 rounded-r-lg  mt-1 mr-1 ${getLineColor(getHandlerStatus())}`}/>
                <div className={" py-1 "}>

                    <ExchangeDocument completed={status || Boolean(responseKey)}
                                      error={failed}
                                      bad={Boolean(responseBad)} fileKey={responseKey} title={"Handled"}
                                      status={getHandlerStatus()}
                                      type={"handler"}/>
                </div>
            </div>

        </div>
        <div
            className={`flex ${getFooterColor(getHandlerStatus())} bg-gray-100 text-xs flex-row gap-3 pt-0.5 pb-1 px-2`}>
            <span>  {finishedOn ? <span> <span
                className={"text-gray-400"}>Elapsed Time</span> {getDateDifferenceHumanized(finishedOn, startedOn)}</span> : "Running"}</span>
            <span><span
                className={"text-gray-400"}>Started </span> {getDateDifferenceHumanized(dayjs().toDate(), startedOn)}<span
                className={"text-gray-400 ml-1"}>ago </span></span>
        </div>
        {/*<div className={"flex flex row justify-between items-center "}>*/}
        {/*    */}
        {/*    <ExchangeDocument status={"good"} type={"receiver"}/>*/}


        {/*    <ExchangeDocument status={getMapperStatus()} type={mapperId ? "mapper" : "skipped"}/>*/}
        {/*    <Pipe type={"Mapper output"} fileKey={outputKey} onClick={() => setDownloadUrl(outputKey)}*/}
        {/*          error={Boolean(mapperId) && Boolean(failed) && !outputKey}*/}
        {/*          completed={!mapperId || Boolean(outputKey)}/>*/}


        {/*    <ExchangeDocument status={getHandlerStatus()} type={"handler"}/>*/}
        {/*    <Pipe type={"Response"} fileKey={responseKey} onClick={() => setDownloadUrl(responseKey)}*/}
        {/*          completed={status || Boolean(responseKey)}*/}
        {/*          bad={Boolean(responseBad)}*/}

        {/*          error={failed}/>*/}


        {/*</div>*/}
    </div>
}
export default React.memo(ExchangeJourney)