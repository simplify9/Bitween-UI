import MainInfo from "src/components/Dashboard/MainInfo";
import DataInCharts from "src/components/Dashboard/DataInCharts";
import XchangeAndSubInfo from "src/components/Dashboard/XchangeAndSubInfo";


export default () => {


    return (
        <div className={"flex flex-col gap-3 mt-3 "}>
            <MainInfo/>

            <XchangeAndSubInfo/>
            <DataInCharts/>
        </div>
    )
}

