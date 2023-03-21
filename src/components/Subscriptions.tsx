import {useCallback, useState} from "react";
import {useSubscriptionFinder} from "../hooks/queryHooks";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {SubscriptionFinderPanel} from "./Subscriptions/SubscriptionFinder";
import {SubscriptionList} from "./Subscriptions/SubscriptionList";
import {apiClient} from "../client";
import {ICreateSubscription} from "../types/subscriptions";
import Button from "./common/forms/Button";
import CreateNewSubscription from "./Subscriptions/CreateNewSubscription";
import Authorize from "src/components/common/authorize/authorize";


const defaultQuery = {
    nameContains: "",
    offset: 0,
    limit: 20,
    orderBy: {
        field: "Name"
    }
}


export type SubscriptionSpecs = {
    nameContains: string
}

const useQuery = useSubscriptionFinder;

interface Props {

}

const Component = ({}: Props) => {

    const [creatingOn, setCreatingOn] = useState(false);
    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<SubscriptionSpecs>({
        nameContains: '',

    });

    const handleFindRequested = useCallback(() => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            nameContains: findSpecs.nameContains,
            offset: 0,
        });
    }, [findSpecs.nameContains, newQuery, queryState.lastSent])

    const handleViewOptionsChange = useCallback((viewOptions: DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            offset: viewOptions.offset,
            limit: viewOptions.limit,
            orderBy: viewOptions.orderBy
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
            <div className="flex flex-col w-full  md:max-w-[1000px]">
                <div className="flex justify-between w-full items-center shadow p-2 my-2  rounded-lg bg-white ">
                    <SubscriptionFinderPanel value={findSpecs} onChange={setFindSpecs}
                                             onFindRequested={handleFindRequested}/>
                    <div>
                        <Authorize roles={["Admin", "Editor"]}>
                            <Button onClick={() => setCreatingOn(true)}
                            >
                                Add
                            </Button>
                        </Authorize>
                    </div>

                </div>

                {queryState.response !== null
                    ? <div className={"shadow-lg  rounded-xl overflow-hidden  "}>
                        <SubscriptionList data={queryState.response.data}/>
                        <DataListViewSettingsEditor
                            orderByFields={[
                                {value: "Name", key: "Name"},
                                {value: "Id", key: "Id"},
                                {
                                    value: "DocumentId",
                                    key: "Document"
                                }]}
                            orderBy={queryState.lastSent.orderBy}
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                    </div>
                    : null}

            </div>
            {creatingOn && <CreateNewSubscription onAdd={createSubscription}
                                                  onClose={() => setCreatingOn(false)}/>}
        </>
    )
}

export default Component;



