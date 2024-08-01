import {useNavigate, useParams} from "react-router-dom";
import Button from "./common/forms/Button";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import React, {useCallback, useEffect, useState} from "react";
import {apiClient} from "../client";
import {OptionType} from "../types/common";
import {ISubscription, ScheduleView, SubscriptionTypeOptions} from "../types/subscriptions";
import {ChoiceEditor} from "./common/forms/ChoiceEditor";
import DocumentSelector from "./Documents/DocumentSelector";
import PartnerSelector from "./Partners/PartnerSelector";
import AdapterEditor from "./Subscriptions/AdapterEditor";
import SubscriptionSelector from "./Subscriptions/SubscriptionSelector";
import ScheduleEditor from "./Subscriptions/ScheduleEditor";
import SubscriptionFilter from "src/components/Subscriptions/SubscriptionFilter";
import {TrailBaseModel} from "src/types/trail";
import TrialsViewModal from "src/components/common/trails/trialsViewModal";
import MatchExpressionEditor from "src/components/Subscriptions/MatchExpressionEditor/MatchExpressionEditor";
import Authorize from "src/components/common/authorize/authorize";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import {MdOutlineContentCopy} from "react-icons/md";

import {
    useAggregateSubscriptionMutation,
    useCreateDraftSubscriptionMutation,
    useDraftSubscriptionQuery,
    useLazySubscriptionQuery,
    usePauseSubscriptionMutation,
    useReceiveSubscriptionMutation,
    useSubscriptionCategoriesQuery,
    useUpdateDraftSubscriptionMutation,
    useUpdateSubscriptionMutation
} from "src/client/apis/subscriptionsApi";
import dayjs from "dayjs";
import {useAdapterMetadataQuery} from "src/client/apis/generalApi";

const Component = () => {
    let navigate = useNavigate();
    let params = useParams();
    const id = Number(params.id)
    const [openModal, setOpenModal] = useState<"NONE" | "TRAIL">("NONE");
    const [subscriptionTrail, setSubscriptionTrail] = useState<TrailBaseModel[]>([]);
    const [updateSubscriptionData, setUpdateSubscriptionData] = useState<ISubscription>({})
    const subscriptionCategories = useSubscriptionCategoriesQuery({limit: 1000, offset: 0})
    const [aggregateNow] = useAggregateSubscriptionMutation()
    const [getSubscription] = useLazySubscriptionQuery()
    const [pauseSubscription] = usePauseSubscriptionMutation()
    const [updateSubscription] = useUpdateSubscriptionMutation()
    const [createDraftSubscription] = useCreateDraftSubscriptionMutation()
    const [updateDraftSubscription] = useUpdateDraftSubscriptionMutation()
    const [receiveNow] = useReceiveSubscriptionMutation()
    const [draftId, setDraftId] = useState<number | null>(null)
    const mapperMetadata = useAdapterMetadataQuery(updateSubscriptionData.mapperId, {skip: !updateSubscriptionData.mapperId})
    const handlerMetadata = useAdapterMetadataQuery(updateSubscriptionData.handlerId, {skip: !updateSubscriptionData.handlerId})
    const receiverMetadata = useAdapterMetadataQuery(updateSubscriptionData.receiverId, {skip: !updateSubscriptionData.receiverId})
    const validatorMetadata = useAdapterMetadataQuery(updateSubscriptionData.validatorId, {skip: !updateSubscriptionData.validatorId})
    const drafts = useDraftSubscriptionQuery(id)

    useEffect(() => {
        if (id) {
            refreshSubscription((id));
        }
    }, [id]);
    const onClickAggregateNow = () => {
        aggregateNow((id))
    }
    const onClickReceiveNow = () => {
        receiveNow((id))
    }
    const refreshSubscription = async (id: number) => {
        let res = await getSubscription(id);
        if (res.data) {
            const data = structuredClone({
                id,
                ...res.data,
                schedules: res.data.schedules.map((s: ScheduleView, index: number) => ({
                    ...s,
                    id: index
                }))
            })
            setUpdateSubscriptionData(data)
        }
    }
    const onClickUpdateSubscription = async () => {
        await updateSubscription(updateSubscriptionData);
        await getTrails();

    }
    const onClickSaveAsDraft = async () => {
        await updateSubscription(updateSubscriptionData);
        await getTrails();

    }
    const deleteSubscription = async () => {
        let res = await apiClient.deleteSubscription(id!);
        if (res.succeeded) navigate('/subscriptions')
    }
    const getTrails = async () => {
        let res = await apiClient.findSubscriptionTrail(id!);
        if (res.succeeded) setSubscriptionTrail(res.data.result)
    }
    const onChangeSubscriptionData = useCallback((key: keyof ISubscription, value: any) => {
        setUpdateSubscriptionData((s) => ({
            ...s,
            [key]: value
        }))
    }, [])
    const onPauseSubscription = useCallback(() => {
        onChangeSubscriptionData('pausedOn', updateSubscriptionData?.pausedOn ? null : dayjs().toISOString())
        pauseSubscription(updateSubscriptionData.id)
    }, [updateSubscriptionData?.id, updateSubscriptionData?.pausedOn])

    if (!updateSubscriptionData) return <></>

    return (
        <div className="flex flex-col w-full  ">
            {
                openModal === "TRAIL" &&
                <TrialsViewModal data={subscriptionTrail} onClose={() => setOpenModal("NONE")}/>
            }

            {Boolean(updateSubscriptionData?.lastException) &&
                <div className={"shadow-xl bg-white  p-2 rounded-lg border-rose-500 border-2 mb-5"}>
                    <h2 className={"text-2xl font-bold text-red-600 uppercase"}>
                        Last Exception !
                    </h2>
                    <div className={"bg-gray-200 rounded mt-2 px-2 pt-2 pb-3 flex flex-row  justify-between"}>
                        <p className={" text-gray-600 text-wrap  break-all"}>
                            {updateSubscriptionData.lastException?.split("{{newline}}").map((d, i) => <p
                                key={i}>{d}</p>)}
                        </p>
                        <div className={"ml-5 mt-1"}>
                            <MdOutlineContentCopy className={"cursor-pointer active:scale-125"} size={21}
                                                  onClick={() => {
                                                      navigator.clipboard.writeText(updateSubscriptionData.lastException.replaceAll('{{newline}}', '\n'))
                                                  }}/>
                        </div>
                    </div>

                </div>}
            <div className={"px-1 flex gap-3"}>

                <div>
                    Editing published version
                </div>
                <div>
                    Draft
                </div>

            </div>
            <div className={"shadow-lg bg-white rounded-lg mb-6 border px-2 py-2  mt-3 pt-3 px-3"}>


                <div
                    className="flex flex-row  flex-wrap items-end  gap-5 ">
                    <div className=" ">
                        <FormField title="Name" className="grow">
                            <TextEditor value={updateSubscriptionData?.name}
                                        onChange={(e) => onChangeSubscriptionData("name", e)}
                            />
                        </FormField>
                    </div>
                    <div className=" ">
                        <FormField title="Category" className="grow">
                            <ChoiceEditor
                                value={updateSubscriptionData?.categoryId?.toString()}
                                onChange={(e) => onChangeSubscriptionData("categoryId", e)}
                                optionTitle={(item) => item.code}
                                optionValue={(item) => item.id}
                                options={subscriptionCategories.data?.result ?? []}/>
                        </FormField>
                    </div>
                    <div className=" ">
                        <FormField title="Type" className="grow">
                            <ChoiceEditor
                                disabled={true}
                                value={updateSubscriptionData?.type?.toString()}
                                onChange={(e) => onChangeSubscriptionData("type", e)}
                                optionTitle={(item: OptionType) => item.title}
                                optionValue={(item: OptionType) => item.id}
                                options={SubscriptionTypeOptions}/>
                        </FormField>
                    </div>


                    <div className=" ">
                        <FormField title="Document" className="grow">
                            <DocumentSelector disabled={true}
                                              value={updateSubscriptionData?.documentId}
                                              onChange={(e) => onChangeSubscriptionData("documentId", e)}
                            />
                        </FormField>
                    </div>

                    <div className=" ">
                        <FormField title="Partner" className="grow">
                            <PartnerSelector disabled={true}
                                             value={updateSubscriptionData?.partnerId}
                                             onChange={(e) => onChangeSubscriptionData("partnerId", e)}


                            />
                        </FormField>
                    </div>


                </div>
                <div className={"flex flex-row justify-between mt-5"}>
                    <div className={"grid grid-cols-2 flex-row  items-center w-[240px] "}
                         key={updateSubscriptionData?.pausedOn}>
                        <CheckBoxEditor checked={updateSubscriptionData?.inactive}
                                        label={'Inactive'}
                                        onChange={(e) => onChangeSubscriptionData("inactive", e)}
                        />
                        <CheckBoxEditor label={'Paused'} checked={Boolean(updateSubscriptionData?.pausedOn)}
                                        onChange={() => onPauseSubscription()}
                        />
                    </div>
                    <div>
                        <Button onClick={() => {
                            getTrails()
                            setOpenModal("TRAIL")
                        }}
                        >
                            Trail
                        </Button>
                    </div>

                </div>
            </div>

            <div className="flex flex-col gap-6 rounded-lg mb-6 ">

                {
                    updateSubscriptionData?.type == "1" &&
                    <MatchExpressionEditor
                        onChange={(e) => onChangeSubscriptionData("matchExpression", e)}
                        documentId={updateSubscriptionData.documentId}
                        expression={updateSubscriptionData.matchExpression}
                    />
                }
                {(!updateSubscriptionData.matchExpression && updateSubscriptionData?.type == "1") &&
                    <div
                        className="bg-white  border shadow-lg rounded-lg px-2 py-2 w-1/2">
                        <FormField title="Filters" className="grow">
                            <SubscriptionFilter
                                documentId={updateSubscriptionData.documentId}
                                onChange={(e) => onChangeSubscriptionData("documentFilter", e)}
                                documentFilter={updateSubscriptionData?.documentFilter}/>
                        </FormField>
                    </div>}
                {updateSubscriptionData?.type == "8" &&
                    <div
                        className="bg-white border shadow-lg px-2 py-2 rounded-lg w-1/2">

                        <FormField title="Aggregation">
                            <SubscriptionSelector
                                value={updateSubscriptionData.aggregationForId}
                                onChange={(e) => onChangeSubscriptionData("aggregationForId", updateSubscriptionData.aggregationForId)}
                                disabled={true}
                            />
                        </FormField>


                        <div className={"mt-5"}>

                            <ScheduleEditor title={"Schedule"}
                                            onChangeSchedules={(e) => onChangeSubscriptionData("schedules", e)}
                                            schedule={updateSubscriptionData.schedules}
                            />
                        </div>


                    </div>}
                {updateSubscriptionData?.type == "2" &&
                    <div
                        className="bg-white border shadow-lg rounded-lg px-2 py-2 w-1/2">
                        <AdapterEditor
                            modifiedOn={validatorMetadata.data?.timestamp}
                            title={"Validator"}
                            type={"validators"}
                            value={updateSubscriptionData?.validatorId}
                            onChange={(t) => setUpdateSubscriptionData({
                                ...updateSubscriptionData,
                                validatorId: t
                            })}
                            onPropsChange={(e) => onChangeSubscriptionData("validatorProperties", e)}
                            props={updateSubscriptionData?.validatorProperties}
                        />


                    </div>}

                {updateSubscriptionData?.type == "4" &&
                    <div
                        className=" bg-white w-1/2 border shadow-lg rounded-lg px-2 py-2">
                        <AdapterEditor title={"Receiver"} type={"receivers"}
                                       modifiedOn={receiverMetadata.data?.timestamp}
                                       value={updateSubscriptionData?.receiverId}
                                       onChange={(t) => setUpdateSubscriptionData({
                                           ...updateSubscriptionData,
                                           receiverId: t
                                       })}
                                       onPropsChange={(e) => onChangeSubscriptionData("receiverProperties", e)}
                                       props={updateSubscriptionData?.receiverProperties}
                        />
                        <ScheduleEditor title={"Schedule"}
                                        onChangeSchedules={(e) => onChangeSubscriptionData("schedules", e)}
                                        schedule={updateSubscriptionData.schedules}/>

                    </div>}

                <div className={" flex flex-row gap-3"}>
                    <div
                        className=" bg-white border rounded-lg shadow-lg px-2 py-2 w-1/2">
                        <AdapterEditor
                            modifiedOn={mapperMetadata.data?.timestamp}
                            title={"Mapper"}
                            type={"mappers"}
                            value={updateSubscriptionData?.mapperId}
                            onChange={(t) => setUpdateSubscriptionData({
                                ...updateSubscriptionData,
                                mapperId: t
                            })}
                            onPropsChange={(e) => onChangeSubscriptionData("mapperProperties", e)}
                            props={updateSubscriptionData?.mapperProperties}
                        />
                    </div>
                    <div
                        className="bg-white border shadow-lg rounded-lg px-2 py-2 w-1/2">

                        <AdapterEditor title={"Handler"} type={"handlers"}
                                       modifiedOn={handlerMetadata.data?.timestamp}

                                       value={updateSubscriptionData?.handlerId}
                                       onChange={(t) => setUpdateSubscriptionData({
                                           ...updateSubscriptionData,
                                           handlerId: t
                                       })}
                                       onPropsChange={(e) => onChangeSubscriptionData("handlerProperties", e)}
                                       props={updateSubscriptionData?.handlerProperties}
                        />

                        <div className={"pt-1"}>
                            <h6 className={"mb-2 mt-1 text-xs font-bold tracking-wide text-gray-700  uppercase"}>
                                Response subscription
                            </h6>
                            <SubscriptionSelector onChange={(t) => setUpdateSubscriptionData({
                                ...updateSubscriptionData,
                                responseSubscriptionId: Number(t)
                            })} value={updateSubscriptionData.responseSubscriptionId?.toString()}/>
                            <div className={"my-3"}/>
                            <FormField title="Response message type name" className="grow pt-2">
                                <TextEditor onChange={(e) => onChangeSubscriptionData("responseMessageTypeName", e)}
                                            value={updateSubscriptionData.responseMessageTypeName}/>
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>

            <div className={"flex flex-row justify-between w-full gap-2"}>

                <div className={"flex flex-row"}>
                    <Authorize roles={["Admin", "Member"]}>
                        <Button variant={"secondary"} onClick={deleteSubscription}
                        >
                            Delete
                        </Button>
                    </Authorize>


                </div>
                <div className={"flex flex-row"}>
                    {
                        updateSubscriptionData.type == '8' && <Authorize roles={["Admin", "Member"]}>


                            <Button className={"mx-8"} variant={"secondary"} onClick={onClickAggregateNow}
                            >
                                Aggregate Now
                            </Button>
                        </Authorize>
                    }
                    {
                        updateSubscriptionData.type == '4' && <Authorize roles={["Admin", "Member"]}>
                            <Button variant={"secondary"} onClick={onClickReceiveNow} className={"mx-8"}>
                                Receive Now
                            </Button>
                        </Authorize>
                    }

                    <Button
                        variant={"secondary"}
                        onClick={() => navigate('/subscriptions')}
                    >
                        Cancel
                    </Button>
                    <Authorize roles={["Admin", "Member"]}>
                        <Button
                            onClick={onClickUpdateSubscription}>
                            Save as draft
                        </Button>
                    </Authorize>
                    <Authorize roles={["Admin"]}>
                        <Button
                            onClick={onClickUpdateSubscription}>
                            Save
                        </Button>
                    </Authorize>
                </div>

            </div>


        </div>
    );
}

export default Component;
