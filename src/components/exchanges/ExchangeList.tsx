import {format} from "date-fns"
import ExchangeStatus from "./ExchangeStatus"
import {IXchange} from "src/types/xchange";
import ExchangeProperty from "./ExchangeProperty";
import React, {useState} from "react";
import {getDateDifference} from "src/utils/DateUtils";
import ExchangeJourney from "src/components/exchanges/ExchangeJourney";
import RetryModal from "src/components/exchanges/RetryModal";
import BulkRetryModal from "src/components/exchanges/BulkRetryModal";

interface Props {
    data: IXchange[]
    refresh: () => void;
    selectedRowsIds: string[]
    setSelectedRowsIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const ExchangeList: React.FC<Props> = ({data, refresh, setSelectedRowsIds, selectedRowsIds}) => {

    const [showExceptionFor, setShowExceptionFor] = useState<string | null>(null);


    const onClickRow = (id: string) => {
        if (selectedRowsIds.includes(id)) {
            setSelectedRowsIds((arr) => ([...arr.filter(i => i !== id)]))

        } else {
            setSelectedRowsIds((arr) => ([...arr, id]))

        }
    }
    return (
        <>
            <table className="appearance-none min-w-full max-w-100">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-4 py-2 text-left">
                        Identification
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-4 py-2 text-left">
                        Subscription
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-4 py-2 text-left">
                        Status
                    </th>
                    <th scope="col" colSpan={2} className="text-sm font-medium text-gray-900 px-4 py-2 text-left">


                    </th>


                    <th scope="col" className="text-sm font-medium text-gray-900 px-4 py-2 text-left">
                        Properties
                    </th>

                </tr>
                </thead>
                <tbody className={"max-w-full"}>
                {
                    data.map((i) => (
                        <tr key={i.id}
                            className={`${selectedRowsIds.includes(i.id) ? 'bg-teal-50' : "bg-white"} border-b cursor-pointer`}
                            onClick={() => onClickRow(i.id)}
                        >
                            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                <div className={"flex flex-col gap-2 text-xs    "}>
                                    <div className={"flex gap-1"}>
                                        <span> ID:</span> {i.id}</div>
                                    <div className={"flex gap-1"}>
                                        <span> CID:</span>
                                        {i.correlationId}</div>
                                    {i.retryFor && <div className={"flex gap-1"}>
                                        <span>Retry For:</span>
                                        {i.retryFor}</div>}
                                </div>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap">
                                <div className={"flex flex-col gap-2"}>
                                    <div className={"flex gap-1"}>
                                        <svg className="w-5 h-90" xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 4445 5218" shapeRendering="geometricPrecision"
                                             textRendering="geometricPrecision" imageRendering="optimizeQuality"
                                             fillRule="evenodd" clipRule="evenodd">
                                            <path
                                                d="M1339 3691c-74 0-134-60-134-134s60-134 134-134h996c74 0 134 60 134 134s-60 134-134 134h-996zm0-1896c-74 0-134-60-134-134s60-134 134-134h1767c74 0 134 60 134 134s-60 134-134 134H1339zM311 0h3823c86 0 164 35 220 91s91 134 91 220v4595c0 86-35 164-91 220s-134 91-220 91H311c-86 0-164-35-220-91S0 4992 0 4906V311c0-86 35-164 91-220S225 0 311 0zm3823 268H311c-12 0-23 5-31 13s-13 19-13 31v4595c0 12 5 23 13 31s19 13 31 13h3823c12 0 23-5 31-13s13-19 13-31V312c0-12-5-23-13-31s-19-13-31-13zM1339 2743c-74 0-134-60-134-134s60-134 134-134h1767c74 0 134 60 134 134s-60 134-134 134H1339z"
                                                fillRule="nonzero"/>
                                        </svg>
                                        {i.documentName}</div>
                                    <div className={"flex gap-1"}>
                                        <svg className="w-5 h-100" xmlns="http://www.w3.org/2000/svg"
                                             shapeRendering="geometricPrecision" textRendering="geometricPrecision"
                                             imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd"
                                             viewBox="0 0 457 512.53">
                                            <path
                                                d="m297.8 173.62 15.62 15.25c4.11 4.02 4.19 10.66.18 14.78l-12.29 12.57a82.424 82.424 0 0 1 7.96 20.49l16.11-.2c5.74-.07 10.5 4.58 10.57 10.32l.25 21.83c.07 5.75-4.57 10.51-10.32 10.57l-17.57.21a82.532 82.532 0 0 1-8.87 20.09l11.53 11.26c4.11 4.02 4.19 10.67.18 14.77l-15.25 15.63c-4.02 4.11-10.67 4.19-14.78.17l-12.58-12.28a82.505 82.505 0 0 1-20.48 7.96l.19 16.1c.07 5.75-4.58 10.51-10.32 10.58l-21.83.25c-5.74.07-10.5-4.57-10.57-10.32l-.21-17.57a83.289 83.289 0 0 1-20.09-8.88l-11.26 11.54c-4.02 4.11-10.67 4.19-14.78.17l-15.61-15.25c-4.12-4.02-4.2-10.66-.18-14.78l12.28-12.57c-3.54-6.44-6.24-13.34-7.96-20.48l-16.11.19c-5.74.07-10.5-4.58-10.57-10.32l-.25-21.83c-.07-5.74 4.57-10.5 10.32-10.57l17.57-.21a83.765 83.765 0 0 1 8.87-20.1l-11.53-11.26c-4.11-4.02-4.18-10.66-.17-14.77l15.25-15.62c4.01-4.11 10.66-4.19 14.77-.17l12.58 12.28a82.503 82.503 0 0 1 20.48-7.96l-.19-16.1c-.07-5.74 4.58-10.5 10.33-10.57l21.82-.26c5.75-.07 10.5 4.57 10.57 10.32l.21 17.57a83.224 83.224 0 0 1 20.11 8.87l11.25-11.53c4.02-4.11 10.67-4.18 14.78-.17h-.01zm-81.6-57.98V91.29a46.446 46.446 0 0 1-20.97-12.07c-8.4-8.44-13.6-20.05-13.6-32.82 0-12.75 5.19-24.35 13.6-32.76l.04-.04c8.41-8.4 20-13.6 32.76-13.6 12.76 0 24.36 5.2 32.77 13.6l.04.04c8.4 8.41 13.6 20.01 13.6 32.76 0 12.77-5.2 24.38-13.62 32.79a46.113 46.113 0 0 1-22.35 12.45v23.65c-6.59.03-13.21.17-19.8.25-.83.01-1.65.04-2.47.1zm22.88 305.41c8.35 2.04 15.82 6.37 21.72 12.26l.04.05c8.4 8.41 13.6 20 13.6 32.76 0 12.76-5.2 24.35-13.6 32.76l-.04.05c-8.41 8.4-20.01 13.6-32.77 13.6-12.76 0-24.35-5.2-32.76-13.6l-.04-.05c-8.41-8.41-13.6-20-13.6-32.76 0-12.76 5.19-24.35 13.6-32.76l.04-.05c5.86-5.85 13.27-10.15 21.54-12.22v-23.84c7.16-.01 14.35-.18 21.5-.26l.77-.02v24.08zm6.02 27.96c-4.33-4.33-10.37-7.02-17.07-7.02-6.69 0-12.73 2.69-17.06 7.02l-.05.04c-4.33 4.34-7.02 10.37-7.02 17.07 0 6.7 2.69 12.73 7.02 17.07l.05.04c4.33 4.33 10.37 7.02 17.06 7.02 6.7 0 12.74-2.69 17.07-7.02l.04-.04c4.34-4.34 7.03-10.37 7.03-17.07 0-6.7-2.69-12.73-7.03-17.07l-.04-.04zm0-419.71c-4.33-4.34-10.37-7.03-17.07-7.03-6.69 0-12.73 2.69-17.06 7.03l-.05.04c-4.33 4.33-7.02 10.37-7.02 17.06 0 6.7 2.69 12.74 7.02 17.08 4.41 4.36 10.45 7.06 17.11 7.06 6.67 0 12.71-2.7 17.07-7.06 4.38-4.34 7.07-10.38 7.07-17.08 0-6.69-2.69-12.73-7.03-17.06l-.04-.04zm165.49 285.36c12.76 0 24.36 5.2 32.77 13.6l.04.04c8.4 8.41 13.6 20.01 13.6 32.77 0 12.76-5.2 24.35-13.6 32.76l-.04.05c-8.41 8.4-20.01 13.59-32.77 13.59-12.76 0-24.37-5.2-32.78-13.62-8.42-8.37-13.63-19.98-13.63-32.78 0-4.68.7-9.2 1.99-13.46l-22.02-12.72c2.22-5.46 3.3-11.3 3.23-17.13-.02-2.34-.24-4.67-.63-6.97l30.75 17.75.28-.28c8.39-8.39 20.01-13.6 32.81-13.6zm17.07 29.3c-4.33-4.34-10.37-7.03-17.07-7.03-6.66 0-12.71 2.71-17.07 7.07a24.07 24.07 0 0 0-7.06 17.07c0 6.67 2.7 12.7 7.06 17.06 4.34 4.38 10.38 7.07 17.07 7.07 6.7 0 12.74-2.69 17.07-7.02l.04-.05c4.34-4.33 7.03-10.36 7.03-17.06 0-6.7-2.69-12.74-7.03-17.07l-.04-.04zm-381.25-29.3c12.54 0 23.94 5 32.29 13.09l28.75-16.61c-.21 1.85-.3 3.7-.28 5.56.06 6.15 1.42 12.27 4.03 17.93l-20.69 11.95c1.5 4.56 2.31 9.43 2.31 14.49 0 12.8-5.21 24.41-13.6 32.81-8.44 8.39-20.05 13.59-32.81 13.59-12.76 0-24.36-5.19-32.77-13.59l-.04-.05c-8.4-8.41-13.6-20-13.6-32.76 0-12.77 5.2-24.37 13.62-32.79 8.37-8.41 19.98-13.62 32.79-13.62zM63.48 344a24.096 24.096 0 0 0-17.07-7.07c-6.67 0-12.71 2.71-17.07 7.07-4.38 4.33-7.07 10.37-7.07 17.07 0 6.7 2.69 12.73 7.03 17.06l.04.05c4.33 4.33 10.37 7.02 17.07 7.02 6.69 0 12.73-2.69 17.07-7.02 4.36-4.41 7.06-10.44 7.06-17.11s-2.7-12.71-7.06-17.07zm347.11-239.2c12.81 0 24.42 5.2 32.82 13.6 8.39 8.39 13.59 20 13.59 32.81 0 12.76-5.2 24.36-13.6 32.77l-.04.04c-8.41 8.4-20.01 13.6-32.77 13.6-12.8 0-24.42-5.21-32.81-13.6l-.59-.61-27.45 15.87c.08-1.15.11-2.3.09-3.44a44.001 44.001 0 0 0-4.79-19.5l21-12.14c-1.2-4.12-1.86-8.48-1.86-12.99 0-12.76 5.2-24.35 13.6-32.76l.05-.05c8.41-8.4 20-13.6 32.76-13.6zm17.08 29.34a24.094 24.094 0 0 0-17.08-7.06c-6.7 0-12.73 2.69-17.07 7.02l-.04.04c-4.33 4.34-7.02 10.37-7.02 17.07 0 6.66 2.7 12.71 7.06 17.07a24.096 24.096 0 0 0 17.07 7.07c6.7 0 12.74-2.69 17.07-7.03l.04-.04c4.34-4.33 7.03-10.37 7.03-17.07 0-6.67-2.71-12.72-7.06-17.07zM46.41 104.8c12.76 0 24.35 5.2 32.76 13.6l.05.05c8.4 8.41 13.6 20 13.6 32.76 0 3.76-.46 7.42-1.3 10.92l22.22 13.47a43.973 43.973 0 0 0-3.85 23.58l-28.62-17.35c-.66.75-1.35 1.49-2.05 2.19-8.39 8.39-20.01 13.6-32.81 13.6-12.81 0-24.42-5.21-32.81-13.6C5.2 175.58 0 163.98 0 151.21c0-12.76 5.2-24.35 13.6-32.76l.04-.05c8.41-8.4 20.01-13.6 32.77-13.6zm17.07 29.3c-4.34-4.33-10.37-7.02-17.07-7.02-6.7 0-12.74 2.69-17.07 7.02l-.04.04c-4.34 4.34-7.03 10.37-7.03 17.07 0 6.7 2.69 12.74 7.03 17.07 4.4 4.36 10.44 7.07 17.11 7.07 6.66 0 12.71-2.71 17.07-7.07a24.088 24.088 0 0 0 7.06-17.07c0-6.7-2.69-12.73-7.02-17.07l-.04-.04zm164.5 79.25c23.7-.28 43.15 18.71 43.43 42.4.29 23.7-18.71 43.15-42.41 43.43-23.69.29-43.14-18.71-43.42-42.4-.28-23.7 18.71-43.15 42.4-43.43z"/>
                                        </svg>
                                        {i.subscriptionName}</div>
                                </div>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap z-10">
                                <ExchangeStatus
                                    status={i.status!} responseBad={i.responseBad}
                                    onClick={() => {
                                        setShowExceptionFor(i.id)
                                    }}
                                />


                            </td>


                            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap" colSpan={2}>
                                <ExchangeJourney status={i.status} failed={Boolean(i.exception)} outputBad={i.outputBad}
                                                 mapperId={i.mapperId}
                                                 responseBad={i.responseBad} outputKey={i.outputKey}
                                                 inputKey={i.inputKey} responseKey={i.outputKey}/>
                                <div className={"flex flex-row justify-between gap-5 mt-1 pt-1 border-0 border-t"}>
                                    <div>  {i.finishedOn ? `Took ${getDateDifference(i.finishedOn, i.startedOn, "ms")}` : "Running"}</div>
                                    <div>{format(Date.parse(i.startedOn), "'On' Pp")}</div>
                                </div>
                            </td>

                            <td className="text-sm text-gray-900 font-light px-4 py-4 whitespace-nowrap ">
                                <div className={"flex gap-2 flex flex-wrap max-w-sm"}>
                                    {i.promotedProperties && Object.keys(i.promotedProperties)?.map((k: string) =>
                                        <ExchangeProperty label={k} value={i.promotedProperties[k]}/>)}
                                </div>
                            </td>


                        </tr>
                    ))

                }

                </tbody>
            </table>


            {showExceptionFor && <RetryModal
                xid={showExceptionFor}
                exception={data.find(i => i.id == showExceptionFor)?.exception}
                onClose={() => setShowExceptionFor(null)}
            />}
         

        </>
    )
}
