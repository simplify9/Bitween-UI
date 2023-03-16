import ExchangeStatus from "./ExchangeStatus"
import {IXchange} from "src/types/xchange";
import ExchangeProperty from "./ExchangeProperty";
import React, {useState} from "react";
import {getDateDifferenceHumanized} from "src/utils/DateUtils";
import ExchangeJourney from "src/components/exchanges/ExchangeJourney";
import RetryModal from "src/components/exchanges/RetryModal";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import dayjs from "dayjs";
import {HiDocument} from "react-icons/hi";
import {TbArrowsRandom} from "react-icons/tb";
import {NavLink} from "react-router-dom";

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
            <table className="appearance-none min-w-full max-w-100 ">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-2 py-2 text-left">
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-2 py-2 text-left">
                        Subscription
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-2 py-2 text-left">
                        Status
                    </th>
                    <th scope="col" colSpan={5}
                        className="text-sm font-medium text-gray-900 px-6 py-2 text-left min-w-[330px]">
                    </th>
                    <th scope="col" colSpan={2} className="text-sm font-medium text-gray-900 px-4 py-2 text-left">
                        Properties
                    </th>

                </tr>
                </thead>
                <tbody className={"max-w-full"}>
                {
                    data.map((i) => (
                        <tr key={i.id}
                            className={`${selectedRowsIds.includes(i.id) ? 'bg-primary-50' : "bg-white"} border-b`}
                        >
                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap">
                                <div className={"flex flex-row items-center "}>
                                    <div className={"mr-3"}>
                                        <CheckBoxEditor onChange={() => onClickRow(i.id)}
                                                        checked={selectedRowsIds.includes(i.id)}/>
                                    </div>
                                </div>

                            </td>
                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap">
                                <div className={"flex flex-col gap-2"}>
                                    <NavLink to={`/documents/${i.documentId}`}>
                                        <div className={"flex items-center gap-1 underline cursor-pointer"}>
                                            <HiDocument className={"text-red-600  w-7"}
                                                        size={27}/>
                                            {i.documentName}
                                        </div>
                                    </NavLink>
                                    <NavLink to={`/subscriptions/${i.subscriptionId}`}>
                                        <div className={"flex items-center gap-1 underline cursor-pointer"}>
                                            <TbArrowsRandom className={"text-red-600 w-7"}
                                                            size={25}/>
                                            {i.subscriptionName}
                                        </div>
                                    </NavLink>
                                </div>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap z-10">
                                <ExchangeStatus
                                    status={i.status!} responseBad={i.responseBad}
                                    onClick={() => {
                                        setShowExceptionFor(i.id)
                                    }}
                                />

                            </td>


                            <td className="text-sm text-gray-900 font-light  py-2 whitespace-nowrap" colSpan={5}>
                                <ExchangeJourney status={i.status} failed={Boolean(i.exception)} outputBad={i.outputBad}
                                                 mapperId={i.mapperId}
                                                 responseBad={i.responseBad}
                                                 outputKey={i.outputKey}
                                                 inputKey={i.inputKey}
                                                 responseKey={i.responseKey}/>
                                <div className={"flex flex-row justify-between gap-5 mt-1 pt-1 border-0 border-t"}>
                                    <div>  {i.finishedOn ? `Took ${getDateDifferenceHumanized(i.finishedOn, i.startedOn)}` : "Running"}</div>
                                    <div>  {`Started ${getDateDifferenceHumanized(dayjs().toDate(), i.startedOn)} ago`}</div>
                                </div>
                            </td>

                            <td className="  " colSpan={2}>
                                <div
                                    className={"flex gap-2 px-4 py-2 flex   flex-wrap "}>
                                    <ExchangeProperty className={"text-xs bg-primary-100"} label={"Id"} value={i.id}/>
                                    <ExchangeProperty className={"text-xs bg-primary-100"} label={"Correlation Id"}
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
