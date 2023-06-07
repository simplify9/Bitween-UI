import {useCallback, useState} from "react";
import {useSubscriptionFinder} from "../hooks/queryHooks";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {SubscriptionFinderPanel} from "./Subscriptions/SubscriptionFinder";
import {SubscriptionList} from "./Subscriptions/SubscriptionList";
import {apiClient} from "../client";
import {ICreateSubscription, IDuplicateSubscription, ISubscription} from "../types/subscriptions";
import Button from "./common/forms/Button";
import CreateNewSubscription from "./Subscriptions/CreateNewSubscription";
import Authorize from "src/components/common/authorize/authorize";


const defaultQuery = {
    nameContains: "",
    rawsubscriptionproperties: "",
    rawfiltersproperties: '',
    offset: 0,
    limit: 20,
    orderBy: {
        field: "Name"
    }
}


export type SubscriptionSpecs = {
    nameContains: string
    rawsubscriptionproperties?: string
    rawfiltersproperties?: string
}

const useQuery = useSubscriptionFinder;

interface Props {

}

const Component = ({}: Props) => {

    const [openModal, setOpenModal] = useState<"NONE" | "ADD" | "DUPLICATE">("NONE");
    const [dataToDuplicate, setDataToDuplicate] = useState<ISubscription | null>(null);

    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<SubscriptionSpecs>({
        nameContains: '',
        rawsubscriptionproperties: '',
        rawfiltersproperties: ''
    });

    const handleFindRequested = useCallback(() => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            nameContains: findSpecs.nameContains,
            rawsubscriptionproperties: findSpecs.rawsubscriptionproperties,
            rawfiltersproperties: findSpecs.rawfiltersproperties,
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
        const res = await apiClient.createSubscription(subscription);
        if (res.succeeded) {
            setOpenModal("NONE");
            newQuery(queryState.lastSent)
        }
    }, [newQuery, queryState.lastSent])


    const onDuplicateSubscription = async (data: IDuplicateSubscription) => {
        const copiedFrom = await apiClient.findSubscription(dataToDuplicate.id.toString());
        const newSubscription = await apiClient.createSubscription(data);
        copiedFrom.data.inactive = true
        copiedFrom.data.name = data.name
        const res = await apiClient.updateSubscription(newSubscription.data, copiedFrom.data);
        if (res.succeeded) {
            setDataToDuplicate(null)
            setOpenModal("NONE");
            newQuery(queryState.lastSent)
        }
    }
    const handelDuplicate = (data: ISubscription) => {
        setDataToDuplicate(data)
        setOpenModal("DUPLICATE")
    }
    return (
        <>
            <div className="flex flex-col w-full  md:max-w-[1000px]">
                <div className="flex justify-between w-full items-center shadow p-2 my-2  rounded-lg bg-white ">
                    <SubscriptionFinderPanel searchAdapterData value={findSpecs} onChange={setFindSpecs}
                                             onFindRequested={handleFindRequested}/>
                    <div>
                        <Authorize roles={["Admin", "Member"]}>
                            <Button onClick={() => setOpenModal("ADD")}
                            >
                                Add
                            </Button>
                        </Authorize>
                    </div>

                </div>

                {queryState.response !== null
                    ? <div className={"shadow-lg  rounded-xl overflow-hidden  "}>
                        <SubscriptionList handelDuplicate={handelDuplicate} data={queryState.response.data}/>
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
            {openModal === "ADD" && <CreateNewSubscription onAdd={createSubscription}
                                                           onClose={() => setOpenModal("NONE")}/>}
            {(openModal === "DUPLICATE" && dataToDuplicate) &&
                <CreateNewSubscription initialState={{
                    type: dataToDuplicate.type,
                    documentId: dataToDuplicate.documentId,
                    name:`${dataToDuplicate.name} (Copy)`
                }} onAdd={onDuplicateSubscription}
                                       onClose={() => {
                                           setOpenModal("NONE")
                                           setDataToDuplicate(null)
                                       }}/>}
        </>
    )
}

export default Component;



