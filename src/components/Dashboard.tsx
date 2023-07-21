import MainInfo from "src/components/Dashboard/MainInfo";
import SubscriptionsInfo from "src/components/Dashboard/SubscriptionsInfo";
import XchangeInfo from "src/components/Dashboard/XchangeInfo";


export default () => {


    return (
        <div className={"flex flex-col gap-3 mt-3 "}>
            <MainInfo/>
            <XchangeInfo/>
            <SubscriptionsInfo/>
        </div>
    )
}

