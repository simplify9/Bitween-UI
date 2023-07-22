import {useChartsDataPointsQuery, useDashboardXchangesInfoQuery} from "src/client/apis/generalApi";
import React, {useMemo, useState} from "react";
import {Area, AreaChart, ResponsiveContainer, XAxis, YAxis} from 'recharts';
import {useSubscriptionsLookupQuery} from "src/client/apis/subscriptionsApi";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import RetryModal from "src/components/exchanges/RetryModal";
import ExchangeDocumentModal from "src/components/exchanges/ExchangeDocumentModal";

const DataInCharts = () => {
    const subscriptionsLookup = useSubscriptionsLookupQuery()
    const chartsDataPoints = useChartsDataPointsQuery()
    const xChangeInfo = useDashboardXchangesInfoQuery()
    const [exceptionToView, setExceptionToView] = useState<string>("");
    const [xchangeDocumentToView, setXchangeDocumentToView] = useState<string>("");

    const items = useMemo(() => {
            if (!chartsDataPoints.data)
                return []
            return chartsDataPoints.data?.xChangesPerDay?.map(({dateTime, count}) => ({
                name: dateTime,
                Entries: count
            }))
        },
        [chartsDataPoints.data?.xChangesPerDay?.length]
    )

    const subscriptionsData = useMemo(() => {
        if (!subscriptionsLookup.data || !chartsDataPoints.data?.subscriptionsUsageCount)
            return []

        return chartsDataPoints.data?.subscriptionsUsageCount?.map(({subscriptionId, count}) => ({
            name: subscriptionsLookup.data[subscriptionId],
            count: count
        }))

    }, [subscriptionsLookup.data, chartsDataPoints.data?.subscriptionsUsageCount?.length])

    const tickFormatter = (tick, index) => index % 3 === 0 ? tick : '';

    return <div className={"flex flex-col xl:flex-row gap-5"}>
        {exceptionToView && <RetryModal exception={exceptionToView} xid={""} onClose={() => setExceptionToView(null)}/>}
        {
            Boolean(xchangeDocumentToView) &&
            <ExchangeDocumentModal downloadUrl={xchangeDocumentToView!} name={"Response"}
                                   onClose={() => setXchangeDocumentToView(null)}/>
        }

        <div className={"bg-white p-3 rounded-lg shadow-lg xl:w-3/5"}>
            <div className={"mb-3 font-semibold"}>
                Xchanges in the past 3 months
            </div>
            <div className={""}>
                <ResponsiveContainer width="95%" height={400}>
                    <AreaChart
                        data={items}
                    >
                        <XAxis tickFormatter={tickFormatter} dataKey="name" angle={-45} textAnchor="end" fontSize={12}
                               height={50}/>
                        <YAxis/>
                        <Area fill="#ffcec8" type="monotone" dataKey="Entries" stroke="#f6503d" activeDot={{r: 5}}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
        <div className={"bg-white py-3 px-5 rounded-lg  overflow-scroll shadow-lg xl:w-2/5"}>
            <div className={"mb-3 font-semibold"}>
                Recently failed Xchanges
            </div>
            <div className={"min-h-[300px] max-h-[460px] overflow-scroll"}>
                {
                    xChangeInfo.data?.latestFailedxCahanges?.map(i =>
                        <div key={i.subscriptionName}>
                            <div className={"border-b flex justify-between py-2 text-sm "}>
                                <div className={"w-1/5"}>
                                    <div
                                        onClick={() => {
                                            if (!i.responseBad) {
                                                setExceptionToView(i.exception)
                                            }
                                            if (i.responseBad) {
                                                setXchangeDocumentToView(i.responseFileKey)
                                            }
                                        }}
                                        className={"text-center text-xs rounded-full cursor-pointer " + (i.responseBad ? "bg-yellow-400" : "bg-red-600 text-white ")}>
                                        {i.responseBad ? "Bad response" : "Failed"}
                                    </div>

                                </div>
                                <div className={""}>
                                    {i.subscriptionName}
                                </div>
                                <div className={"text-gray-500 text-xs"}>
                                    {toLocalDateTimeString(i.finishedOn)}
                                </div>
                            </div>
                        </div>)}
            </div>
        </div>


    </div>
}
export default React.memo(DataInCharts)