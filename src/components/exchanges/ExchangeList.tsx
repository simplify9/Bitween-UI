import ExchangeStatus from "./ExchangeStatus"
import {IXchange} from "src/types/xchange";
import ExchangeProperty from "./ExchangeProperty";
import React, {useState} from "react";
import ExchangeJourney from "src/components/exchanges/ExchangeJourney";
import RetryModal from "src/components/exchanges/RetryModal";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import {NavLink} from "react-router-dom";
import {MdLoop} from "react-icons/md"

interface Props {
    data: IXchange[]
    refresh: () => void;
    selectedRowsIds: string[]
    setSelectedRowsIds: React.Dispatch<React.SetStateAction<string[]>>
}

const getBorderColor = (responseBad, status) => {
    return responseBad ? "border-yellow-400"
        :
        status != null ?
            status ?
                "border-l-green-500"

                : "border-red-400"
            :
            ""
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
            <table className="appearance-none min-w-full max-w-100 ">
                <thead className="border-y bg-white">
                <tr className={"border-l-8 border-white"}>
                    <th scope="col" className="text-sm font-medium  px-2 py-2 text-left  ">

                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-500 px-2 py-2 text-left border-r">
                        Subscription
                    </th>

                    <th scope="col"
                        className="text-sm font-medium text-gray-500  px-2 py-2 text-left w-[393px] border-r">
                        Progression
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-500  px-2 py-2 text-left">
                        Properties
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-500  px-2 py-2 text-left border-r">
                        Status
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-500  px-6 py-2 text-left border-r">
                        Optiopns
                    </th>

                </tr>
                </thead>
                <tbody className={"max-w-full"}>
                {
                    data.map((i) => (
                        <tr key={i.id}
                            className={`${selectedRowsIds.includes(i.id) ? 'bg-primary-50' : "bg-white"} ${getBorderColor(i.responseBad, i.status)}  border-b border-l-8`}
                        >
                            <td className="text-sm text-gray-900 font-light whitespace-nowrap ">
                                <div className={"flex flex-row items-center  ml-3"}>

                                    <CheckBoxEditor onChange={() => onClickRow(i.id)}
                                                    checked={selectedRowsIds.includes(i.id)}/>

                                </div>

                            </td>
                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap">
                                <div className={"flex flex-col gap-2"}>
                                    <NavLink to={`/documents/${i.documentId}`}>
                                        <div
                                            className={"flex items-center gap-x-2  cursor-pointer border rounded-[12px] px-3 py-2"}>
                                            <img src={"/Icons/document.svg"} className={"h-5"}/>
                                            {i.documentName}
                                        </div>
                                    </NavLink>
                                    {
                                        i.subscriptionId && <NavLink to={`/subscriptions/${i.subscriptionId}`}>
                                            <div
                                                className={"flex items-center gap-x-2  cursor-pointer border rounded-[12px] px-3 py-2"}>
                                                <img src={"/Icons/subscription.svg"} className={"h-5"}/>
                                                {i.subscriptionName}
                                            </div>
                                        </NavLink>
                                    }

                                </div>
                            </td>


                            <td className="text-sm text-gray-900 font-light  py-2 whitespace-nowrap">
                                <ExchangeJourney
                                    finishedOn={i.finishedOn}
                                    startedOn={i.startedOn}
                                    status={i.status} failed={Boolean(i.exception)} outputBad={i.outputBad}
                                    mapperId={i.mapperId}
                                    responseBad={i.responseBad}
                                    outputKey={i.outputKey}
                                    inputKey={i.inputKey}
                                    responseKey={i.responseKey}/>

                            </td>

                            <td className="  ">
                                <div
                                    className={"flex gap-2 px-4 py-2 flex   flex-wrap "}>
                                    <ExchangeProperty className={"text-xs bg-primary-400 text-white "} label={"Id"}
                                                      value={i.id}/>

                                    <ExchangeProperty className={"text-xs bg-primary-400 text-white "}
                                                      label={"Correlation Id"}
                                                      value={i.correlationId}/>
                                    {
                                        i.retryFor &&
                                        <ExchangeProperty className={"text-xs bg-yellow-100"} label={"Retry for"}
                                                          value={i.retryFor}/>

                                    }

                                    {i.promotedProperties && Object.keys(i.promotedProperties)?.map((k: string) =>
                                        <ExchangeProperty className={"text-xs bg-green-100"} key={k} label={k}
                                                          value={i.promotedProperties[k]}/>)}
                                </div>
                            </td>

                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap z-10">
                                <ExchangeStatus
                                    status={i.status!} responseBad={i.responseBad}

                                />

                            </td>
                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap z-10">
                                <div className={"flex items-center justify-center"}>
                                    <MdLoop className={"text-gray-500"} size={24}
                                            onClick={() => setShowExceptionFor(i.id)}/>
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
