import {useCallback, useEffect, useState} from "react";
import {useSubscriptionFinder} from "../hooks/queryHooks";
import {jsBoolean, jsNumber, jsString} from "redux-ecq";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {SubscriptionFinderPanel} from "./Subscriptions/SubscriptionFinder";
import {SubscriptionList} from "./Subscriptions/SubscriptionList";
import {DateTimeRange} from "./common/forms/DateTimeRangeEditor";
import {apiClient} from "../client";
import {ICreateSubscription} from "../types/subscriptions";
import Button from "./common/forms/Button";
import CreateNewSubscription from "./Subscriptions/CreateNewSubscription";
import Authorize from "src/components/common/authorize/authorize";


const defaultQuery = {
    nameContains: "",
    creationDateFrom: undefined,
    creationDateTo: undefined,
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
    nameContains: string
    keywords: string
    creationTimeWindow: DateTimeRange
}

const useQuery = useSubscriptionFinder;

interface Props {

}

const Component = ({}: Props) => {

    const [creatingOn, setCreatingOn] = useState(false);
    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<SubscriptionSpecs>({
        nameContains: '',
        keywords: queryState.lastSent.keywords ?? "",
        creationTimeWindow: {
            from: queryState.lastSent.creationDateFrom,
            to: queryState.lastSent.creationDateTo
        }

    });

    const handleFindRequested = useCallback(() => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            nameContains: findSpecs.nameContains,
            creationDateFrom: findSpecs.creationTimeWindow.from,
            creationDateTo: findSpecs.creationTimeWindow.to,
            offset: 0,
        });
    }, [findSpecs.creationTimeWindow.from, findSpecs.creationTimeWindow.to, findSpecs.nameContains, newQuery, queryState.lastSent])

    const handleViewOptionsChange = useCallback((viewOptions: DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            sortBy: viewOptions.sortBy.field,
            sortByDescending: !!viewOptions.sortBy.descending,
            offset: viewOptions.offset,
            limit: viewOptions.limit
        });
    }, [newQuery, queryState.lastSent])

    const createSubscription = useCallback(async (subscription: ICreateSubscription) => {
        let res = await apiClient.createSubscription(subscription);
        if (res.succeeded) {
            setCreatingOn(false);
            newQuery(queryState.lastSent)
        }
    }, [newQuery, queryState.lastSent])


 
    return (
        <>
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div
                        className="text-2xl font-bold tracking-wide text-gray-700">Subscriptions
                    </div>
                    <Authorize roles={["Admin","Editor"]}>

                    <Button onClick={() => setCreatingOn(true)}
                            className="bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded">
                        Create New Subscription
                    </Button>
                    </Authorize>
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
            {creatingOn && <CreateNewSubscription onAdd={createSubscription}
                                                  onClose={() => setCreatingOn(false)}/>}
        </>
    )
}

export default Component;



