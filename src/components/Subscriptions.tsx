import React, {useCallback, useEffect, useState} from "react";
import {useSubscriptionFinder} from "../hooks/queryHooks";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {SubscriptionFinderPanel} from "./Subscriptions/SubscriptionFinder";
import {SubscriptionList} from "./Subscriptions/SubscriptionList";
import {
    ICreateSubscription,
    IDuplicateSubscription,
    ISubscription,
    SubscriptionFindQuery
} from "../types/subscriptions";
import Button from "./common/forms/Button";
import CreateNewSubscription from "./Subscriptions/CreateNewSubscription";
import Authorize from "src/components/common/authorize/authorize";
import {useNavigate} from "react-router-dom";
import {
    useCreateSubscriptionMutation,
    useLazySubscriptionQuery,
    useLazySubscriptionsQuery,
    useUpdateSubscriptionMutation
} from "src/client/apis/subscriptionsApi";
import {BsSearch} from "react-icons/bs";


const defaultQuery = {
    nameContains: "",
    rawsubscriptionproperties: "",
    rawfiltersproperties: '',
    partnerId: null,
    offset: 0,
    limit: 20,
    orderBy: {
        field: "Name"
    }
}


const useQuery = useSubscriptionFinder;

interface Props {

}

const Component = ({}: Props) => {
    const nav = useNavigate()
    const [fetchData, data] = useLazySubscriptionsQuery();
    const [createSubscription] = useCreateSubscriptionMutation()
    const [updateSubscription] = useUpdateSubscriptionMutation()
    const [getSubscription] = useLazySubscriptionQuery()
    const [openModal, setOpenModal] = useState<"NONE" | "ADD" | "DUPLICATE">("NONE");
    const [dataToDuplicate, setDataToDuplicate] = useState<ISubscription | null>(null);

    const [findSpecs, setFindSpecs] = useState<SubscriptionFindQuery>({
        handlerId: undefined,
        id: undefined,
        isRunning: undefined,
        mapperId: undefined,
        partnerId: undefined,
        receiverId: undefined,
        type: undefined,
        validatorId: undefined,
        nameContains: '',
        rawsubscriptionproperties: '',
        rawfiltersproperties: '',
        categoryId: null,
        limit: 20,
        offset: 0,
        inactive: null
    });

    useEffect(() => {
        fetchData(findSpecs)
    }, [])

    const handleViewOptionsChange = useCallback((viewOptions: DataListViewSettings) => {
        const newSpecs = ({
            ...findSpecs,
            offset: viewOptions.offset,
            limit: viewOptions.limit,
            orderBy: viewOptions.orderBy
        })
        setFindSpecs(newSpecs);
        fetchData(newSpecs)

    }, [])

    const onClickCreateSubscription = useCallback(async (subscription: ICreateSubscription) => {
        const res = await createSubscription(subscription);
        if ('data' in res) {
            setOpenModal("NONE");
        }
    }, [])


    const onDuplicateSubscription = async (data: IDuplicateSubscription) => {
        const copiedFrom = await getSubscription(dataToDuplicate.id);
        const newSubscription = await createSubscription(data);

        if ('data' in newSubscription && copiedFrom.data) {
            copiedFrom.data.inactive = true
            copiedFrom.data.name = data.name
            copiedFrom.data.id = data.id
            copiedFrom.data.id = newSubscription.data
            const res = await updateSubscription(copiedFrom.data);
            if ('data' in res) {
                setDataToDuplicate(null)
                setOpenModal("NONE");
            }
        }
    }
    const handelDuplicate = (data: ISubscription) => {
        setDataToDuplicate(data)
        setOpenModal("DUPLICATE")
    }
    return (
        <>
            <div className="flex flex-col w-full  ">
                <div className="flex flex-col  w-full  shadow p-2 my-2  rounded-lg bg-white ">
                    <SubscriptionFinderPanel searchAdapterData value={findSpecs} onChange={setFindSpecs}
                                             onFindRequested={() => fetchData(findSpecs)}/>
                    <div className={"flex flex-row justify-end"}>
                        <div className={"w-[100px]"}>
                            <Authorize roles={["Admin", "Member"]}>
                                <Button onClick={() => setOpenModal("ADD")}
                                >
                                    Add
                                </Button>
                            </Authorize>
                        </div>
                        <div className={"w-[180px]"}>
                            <Authorize roles={["Admin", "Member"]}>
                                <Button onClick={() => nav("manage-categories")}
                                >
                                    Manage Categories
                                </Button>
                            </Authorize>
                        </div>
                        <div className={"w-[50px] mx-3"}>
                            <Authorize roles={["Admin", "Member"]}>
                                <BsSearch onClick={() => fetchData(findSpecs)} size={33}
                                          className={" mb-2 text-primary-600"}/>
                            </Authorize>
                        </div>
                    </div>

                </div>

                {data.data
                    ? <div className={"shadow-lg  rounded-xl overflow-hidden  md:max-w-[1000px]"}>
                        <SubscriptionList handelDuplicate={handelDuplicate} data={data.data.result}/>
                        <DataListViewSettingsEditor
                            orderByFields={[
                                {value: "Name", key: "Name"},
                                {value: "Id", key: "Id"},
                                {
                                    value: "DocumentId",
                                    key: "Document"
                                }]}
                            orderBy={findSpecs.orderBy}
                            total={data.data.totalCount}
                            offset={findSpecs.offset}
                            limit={findSpecs.limit}
                            onChange={handleViewOptionsChange}/>
                    </div>
                    : null}

            </div>
            {openModal === "ADD" && <CreateNewSubscription onAdd={onClickCreateSubscription}
                                                           onClose={() => setOpenModal("NONE")}/>}
            {(openModal === "DUPLICATE" && dataToDuplicate) &&
                <CreateNewSubscription initialState={{
                    type: dataToDuplicate.type,
                    documentId: dataToDuplicate.documentId,
                    name: `${dataToDuplicate.name} (Copy)`
                }} onAdd={onDuplicateSubscription}
                                       onClose={() => {
                                           setOpenModal("NONE")
                                           setDataToDuplicate(null)
                                       }}/>}
        </>
    )
}

export default Component;



