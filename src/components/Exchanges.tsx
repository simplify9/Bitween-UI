import { useState } from "react";
import { useExchangeFinder } from "../hooks/queryHooks";
import { withUrlSupport } from "../hooks/queryUrlHooks";
import { jsBoolean, jsNumber, jsString } from "redux-ecq";
import { DataListViewSettings, DataListViewSettingsEditor } from "./common/DataListViewSettingsEditor";
import { ExchangeFinderPanel, ExchangeSpecs } from "./exchanges/ExchangeFinderPanel";
import { ExchangeList } from "./exchanges/ExchangeList";


const defaultQuery = {
    mode: "findby",
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

const useQuery = useExchangeFinder;

interface Props {

}

const Component = ({}:Props) => {

    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<ExchangeSpecs>({
        findMode: queryState.lastSent.mode,
        keywords: queryState.lastSent.keywords ?? "",
        findBy: {
            subscription: queryState.lastSent.subscription ?? "",
            creationTimeWindow: {
                from: queryState.lastSent.creationDateFrom,
                to: queryState.lastSent.creationDateTo
            },
            status: queryState.lastSent.status ?? "",
            id: queryState.lastSent.id ?? "",
            correlationId: queryState.lastSent.correlationId ?? "",
            promotedProperties: queryState.lastSent.promotedProperties ?? ""
        }
    });

    const handleFindRequested = () => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            mode: findSpecs.findMode,
            keywords: findSpecs.keywords,
            subscription: findSpecs.findBy.subscription,
            id: findSpecs.findBy.id ?? "",
            correlationId: findSpecs.findBy.correlationId ?? "",
            promotedProperties: findSpecs.findBy.promotedProperties ?? "",
            creationDateFrom: findSpecs.findBy.creationTimeWindow.from,
            creationDateTo: findSpecs.findBy.creationTimeWindow.to,
            status: findSpecs.findBy.status,
            offset: 0,
        });
    }

    const handleViewOptionsChange = (viewOptions:DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
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
            {queryState.response !== null
            ? <>
                <DataListViewSettingsEditor
                    sortByOptions={["subscription", "status", "docType"]}
                    sortByTitles={{
                        subscription: "Subscription",
                        status: "Delivery Status",
                        docType: "Document Type"
                    }}
                    sortBy={{ field: queryState.lastSent.sortBy, descending: queryState.lastSent.sortByDescending }}
                    total={queryState.response.total}
                    offset={queryState.lastSent.offset}
                    limit={queryState.lastSent.limit}
                    onChange={handleViewOptionsChange} />
                <ExchangeList data={queryState.response.data} refresh={handleFindRequested} />
            </>
            : null}

        </div>
    )
}

export default Component;



