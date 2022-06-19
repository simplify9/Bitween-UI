import {useState} from "react";
import {useSubscriptionFinder} from "../hooks/queryHooks";
import {withUrlSupport} from "../hooks/queryUrlHooks";
import {jsBoolean, jsNumber, jsString} from "redux-ecq";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {SubscriptionFinderPanel} from "./Subscriptions/SubscriptionFinder";
import {SubscriptionList} from "./Subscriptions/SubscriptionList";
import {DateTimeRange} from "./common/forms/DateTimeRangeEditor";
import {apiClient} from "../client";
import {ICreateSubscription} from "../types/subscriptions";
import Button from "./common/forms/Button";
import CreateNewSubscription from "./Subscriptions/CreateNewSubscription";


const defaultQuery = {
    mode: "keyword",
    creationDateFrom: undefined,
    creationDateTo: undefined,
    keywords: "",
    offset: 0,
    limit: 20,
    sortBy: "docType",
    sortByDescending: false
}

const queryStringMapping = {
    keywords: jsString(),
    creationDateFrom: jsString(),
    creationDateTo: jsString(),
    mode: jsString(),
    sortBy: jsString(),
    sortByDescending: jsBoolean(),
    offset: jsNumber(),
    limit: jsNumber()
}

export type SubscriptionSpecs = {
    findMode: string
    keywords: string
    findBy: SubscriptionFindBySpecs
}
export type SubscriptionFindBySpecs = {
    creationTimeWindow: DateTimeRange
}

const useQuery = useSubscriptionFinder;

interface Props {

}

const Component = ({}: Props) => {

    const [creatingOn, setCreatingOn] = useState(false);
    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<SubscriptionSpecs>({
        findMode: queryState.lastSent.mode,
        keywords: queryState.lastSent.keywords ?? "",
        findBy: {
            creationTimeWindow: {
                from: queryState.lastSent.creationDateFrom,
                to: queryState.lastSent.creationDateTo
            },
        }
    });

    const handleFindRequested = (findSpecs: SubscriptionSpecs) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            mode: findSpecs.findMode,
            keywords: findSpecs.keywords,
            creationDateFrom: findSpecs.findBy.creationTimeWindow.from,
            creationDateTo: findSpecs.findBy.creationTimeWindow.to,
            offset: 0,
        });
    }

    const handleViewOptionsChange = (viewOptions: DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            sortBy: viewOptions.sortBy.field,
            sortByDescending: !!viewOptions.sortBy.descending,
            offset: viewOptions.offset,
            limit: viewOptions.limit
        });
    }

    const createSubscription = async (subscription: ICreateSubscription) => {
        let res = await apiClient.createSubscription(subscription);
        if (res.succeeded) {
            setCreatingOn(false);
            newQuery(queryState.lastSent)
        }
    }


    return (
        <>
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div className="text-2xl font-bold tracking-wide text-gray-700">Subscriptions</div>
                    <Button onClick={() => setCreatingOn(true)}
                            className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                        Create New Subscription
                    </Button>
                </div>
                <SubscriptionFinderPanel value={findSpecs} onChange={setFindSpecs}
                                         onFindRequested={handleFindRequested}/>
                {queryState.response !== null
                    ? <>
                        <DataListViewSettingsEditor
                            sortByOptions={["subscription", "status", "docType"]}
                            sortByTitles={{
                                subscription: "Subscription",
                                status: "Delivery Status",
                                docType: "Document Type"
                            }}
                            sortBy={{
                                field: queryState.lastSent.sortBy,
                                descending: queryState.lastSent.sortByDescending
                            }}
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                        <SubscriptionList data={queryState.response.data}/>
                    </>
                    : null}

            </div>
            {creatingOn && <CreateNewSubscription onAdd={createSubscription} onClose={() => setCreatingOn(false)}/>}
        </>
    )
}

export default Component;



