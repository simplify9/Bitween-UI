import { useState } from "react";
import { useExchangeFinder } from "../hooks/queryHooks";
import { jsBoolean, jsDateTime, jsNumber, jsString, withUrlSupport } from "../redux-cq";
import { DataListViewSettings, DataListViewSettingsEditor } from "./common/DataListViewSettingsEditor";
import { ExchangeFinderPanel, ExchangeSpecs } from "./exchanges/ExchangeFinderPanel";
import { ExchangeList } from "./exchanges/ExchangeList";


const defaultQuery = { 
    mode: "keyword", 
    subscription: undefined, 
    status: undefined, 
    creationDateFrom: undefined, 
    creationDateTo: undefined, 
    keywords: "",
    offset: 0,
    limit: 20,
    sortBy: "docType",
    sortByDescending: false
}

const queryStringMapping = {
    subscription: jsString(),
    status: jsString(),
    keywords: jsString(),
    creationDateFrom: jsString(),
    creationDateTo: jsString(),
    mode: jsString(),
    sortBy: jsString(),
    sortByDescending: jsBoolean(),
    offset: jsNumber(),
    limit: jsNumber()
}

const useQuery = withUrlSupport(useExchangeFinder, queryStringMapping);

interface Props {

}

const Component = ({}:Props) => {

    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<ExchangeSpecs>({
        findMode: queryState.lastCreatedReq.mode as any,
        keywords: queryState.lastCreatedReq.keywords ?? "",
        findBy: {
            subscription: queryState.lastCreatedReq.subscription ?? "",
            creationTimeWindow: {
                from: queryState.lastCreatedReq.creationDateFrom,
                to: queryState.lastCreatedReq.creationDateTo
            },
            status: queryState.lastCreatedReq.status ?? ""
        }
    });

    const handleFindRequested = (findSpecs:ExchangeSpecs) => {
        newQuery({
            ...queryState.lastCreatedReq,
            mode: findSpecs.findMode,
            keywords: findSpecs.keywords,
            subscription: findSpecs.findBy.subscription,
            creationDateFrom: findSpecs.findBy.creationTimeWindow.from,
            creationDateTo: findSpecs.findBy.creationTimeWindow.to,
            status: findSpecs.findBy.status,
            offset: 0
        });
    }

    const handleViewOptionsChange = (viewOptions:DataListViewSettings) => {
        newQuery({
            ...queryState.lastCreatedReq,
            sortBy: viewOptions.sortBy.field,
            sortByDescending: !!viewOptions.sortBy.descending,
            offset: viewOptions.offset,
            limit: viewOptions.limit
        });
    }

    return (
        <div className="flex flex-col w-full px-8 py-4">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Exchanges</div>
                <div className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                    Create New Exchange
                </div>
            </div>
            <ExchangeFinderPanel value={findSpecs} onChange={setFindSpecs} onFindRequested={handleFindRequested} />
            
            <DataListViewSettingsEditor 
                sortByOptions={["subscription", "status", "docType"]}
                sortByTitles={{ 
                    subscription: "Subscription",
                    status: "Delivery Status",
                    docType: "Document Type"
                }}
                sortBy={{ field: queryState.lastCreatedReq.sortBy, descending: queryState.lastCreatedReq.sortByDescending }}
                total={queryState.total} 
                offset={queryState.lastCreatedReq.offset} 
                limit={queryState.lastCreatedReq.limit} 
                onChange={handleViewOptionsChange} />
            
            <ExchangeList data={queryState.data} />
        </div>
    )
}

export default Component;



