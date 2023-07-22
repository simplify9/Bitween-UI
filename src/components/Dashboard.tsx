import MainInfo from "src/components/Dashboard/MainInfo";
import SubscriptionsInfo from "src/components/Dashboard/SubscriptionsInfo";
import XchangeInfo from "src/components/Dashboard/XchangeInfo";


export default () => {


    return (
        <div className={"flex flex-col gap-3  "}>
            <div className={"text-xs text-gray-400 mb-3"}>*Data points are based on the last 3 months usages</div>
            <MainInfo/>
            <XchangeInfo/>
            <SubscriptionsInfo/>
        </div>
    )
}

