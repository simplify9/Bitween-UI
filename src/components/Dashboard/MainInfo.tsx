import {useDashboardMainInfoQuery, useDashboardXchangesInfoQuery} from "src/client/apis/generalApi";
import React from "react";
import {HiDocument} from "react-icons/hi";
import {BsFillPersonFill} from "react-icons/bs";
import {TbArrowsRandom, TbBellRinging2Filled} from "react-icons/tb";
import ItemInfo from "src/components/Dashboard/ItemInfo";

const MainInfo = () => {
    const {data} = useDashboardMainInfoQuery()
    const xChangeInfo = useDashboardXchangesInfoQuery()

    if (!data)
        return <></>
    return <div className={" grid  grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 flex-row flex-wrap flex-grow w-full  gap-5"}>
        <ItemInfo number={xChangeInfo.data?.totalXchangesCount ?? 0} color={""} title={"Total Xchanges"}
                  icon={<HiDocument
                      className={"w-6 h-6 text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={xChangeInfo.data?.xChangeCountInTimeframe ?? 0} color={""} title={"Total Xchanges"}
                  icon={<HiDocument
                      className={"w-6 h-6 text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={xChangeInfo.data?.successfulXchanges ?? 0} color={""} title={"Successful Xchanges"}
                  icon={<HiDocument
                      className={"w-6 h-6 text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={xChangeInfo.data?.badResponseXchanges ?? 0} color={""}
                  title={"Xchanges with bad response"}
                  icon={<HiDocument
                      className={"w-6 h-6 text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={xChangeInfo.data?.failedXchanges ?? 0} color={""} title={"Failed Xchanges"}
                  icon={<HiDocument
                      className={"w-6 h-6 text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={data.documentCount} color={""} title={"Types of documents"} icon={<HiDocument
            className={"w-6 h-6 text-primary-600"}
            size={27}/>}/>
        <ItemInfo number={data.partnersCount} color={""} title={"Partners connected"}
                  icon={<BsFillPersonFill
                      className={"w-6 h-6  text-primary-600"}
                      size={27}/>}/>
        <ItemInfo number={data.subscriptionsCount} color={""} title={"Subscriptions created"} icon={<TbArrowsRandom
            className={"w-6 h-6  text-primary-600"}
            size={27}/>}/>
        <ItemInfo number={data.notifiersCount} color={""} title={"Notifiers setup"}
                  icon={<TbBellRinging2Filled className={" text-primary-600 w-6 h-6"}
                                              size={27}/>}/>
        <ItemInfo number={data.usersCount} color={""} title={"System users"} icon={<BsFillPersonFill
            className={"w-6 h-6 text-primary-600"}
            size={27}/>}/>
    </div>
}


export default React.memo(MainInfo)