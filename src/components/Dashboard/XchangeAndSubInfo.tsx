import {useChartsDataPointsQuery, useDashboardXchangesInfoQuery} from "src/client/apis/generalApi";
import {useSubscriptionsLookupQuery} from "src/client/apis/subscriptionsApi";
import React, {useMemo} from "react";
import ItemInfo from "src/components/Dashboard/ItemInfo";
import {HiDocument} from "react-icons/hi";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis} from "recharts";

const XchangeAndSubInfo = () => {
    const xChangeInfo = useDashboardXchangesInfoQuery()
    const subscriptionsLookup = useSubscriptionsLookupQuery()
    const chartsDataPoints = useChartsDataPointsQuery()

    const subscriptionsData = useMemo(() => {
        if (!subscriptionsLookup.data || !chartsDataPoints.data?.subscriptionsUsageCount)
            return []

        return chartsDataPoints.data?.subscriptionsUsageCount?.map(({subscriptionId, count}) => ({
            name: subscriptionsLookup.data[subscriptionId],
            count: count
        }))

    }, [subscriptionsLookup.data, chartsDataPoints.data?.subscriptionsUsageCount])

    return <div className={"flex flex-row gap-5 mt-5"}>
        <div className={"bg-white py-3 px-5 rounded-lg shadow-lg w-2/5"}>
            <div className={"mb-3 font-semibold"}>
                Subscriptions actions in the past 3 months
            </div>
            <div className={"min-h-[300px] overflow-scroll"}>
                {
                    subscriptionsData.map(i =>
                        <div key={i.name}>
                            <div className={"border-b flex justify-between py-2"}>
                    <span className={"text-lg"}>
                         {i.name}
                    </span>
                                <span className={"text-lg font-semibold text-primary-500"}>
                       {i.count}
                   </span>
                            </div>
                        </div>)}
            </div>
        </div>
        <div className={"bg-white p-3 rounded-lg shadow-lg w-3/5"}>
            <div className={"mb-3 font-semibold"}>
                Most used subscriptions
            </div>
            <ResponsiveContainer width="95%" height={400}>
                <BarChart
                    data={subscriptionsData}

                >
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Bar dataKey="count" fill="#f6503d"/>
                </BarChart>
            </ResponsiveContainer>
        </div>


    </div>
}
export default XchangeAndSubInfo