import {useNavigate, useParams, Link} from "react-router-dom";
import Button from "./common/forms/Button";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {apiClient} from "../client";
import {OptionType} from "../types/common";
import {
    ISubscription,
    normalizeSubscriptionType,
    ScheduleView,
    SubscriptionType,
    SubscriptionTypeOptions
} from "../types/subscriptions";
import {ChoiceEditor} from "./common/forms/ChoiceEditor";
import DocumentSelector from "./Documents/DocumentSelector";
import PartnerSelector from "./Partners/PartnerSelector";
import AdapterEditor from "./Subscriptions/AdapterEditor";
import { NATIVE_JSON_MAPPER_ID } from "src/types/mapping";
import SubscriptionSelector from "./Subscriptions/SubscriptionSelector";
import ScheduleEditor from "./Subscriptions/ScheduleEditor";
import RetryPolicySelector from "src/components/RetryPolicies/RetryPolicySelector";
import RetryGroupsEditor from "src/components/RetryPolicies/RetryGroupsEditor";
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
    useSubscriptionQuery,
    useLazySubscriptionQuery,
    usePauseSubscriptionMutation,
    usePublishDraftSubscriptionMutation,
    useReceiveSubscriptionMutation,
    useSubscriptionCategoriesQuery,
    useUpdateDraftSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useWorkGroupsQuery
} from "src/client/apis/subscriptionsApi";
import dayjs from "dayjs";
import {useAdapterMetadataQuery} from "src/client/apis/generalApi";
import Dialog from "src/components/common/dialog";
import {useTypedSelector} from "src/state/ReduxSotre";

type EditMode = "PUBLISHED" | "DRAFT";
const Component = () => {
    let navigate = useNavigate();
    let params = useParams();
    const id = Number(params.id)
    const [openModal, setOpenModal] = useState<"NONE" | "TRAIL" | "CREATE_DRAFT">("NONE");
    const [subscriptionTrail, setSubscriptionTrail] = useState<TrailBaseModel[]>([]);
    const [updateSubscriptionData, setUpdateSubscriptionData] = useState<ISubscription>({})
    const [retryPolicyMode, setRetryPolicyMode] = useState<"NONE" | "NAMED" | "CUSTOM">("NONE");
    const savedDataRef = useRef<string>('{}');
    const { workGroupsAvailable } = useTypedSelector(state => state.features);
    const subscriptionCategories = useSubscriptionCategoriesQuery({limit: 1000, offset: 0})
    const workGroups = useWorkGroupsQuery({limit: 1000, offset: 0}, {skip: !workGroupsAvailable})
    const [aggregateNow] = useAggregateSubscriptionMutation()
    const { data: subscriptionData } = useSubscriptionQuery(id, { skip: !id, refetchOnMountOrArgChange: true })
    const [pauseSubscription] = usePauseSubscriptionMutation()
    const [updateSubscription] = useUpdateSubscriptionMutation()
    const [createDraftSubscription] = useCreateDraftSubscriptionMutation()
    const [updateDraftSubscription] = useUpdateDraftSubscriptionMutation()
    const [publishDraft] = usePublishDraftSubscriptionMutation()
    const [receiveNow] = useReceiveSubscriptionMutation()
    const [mode, setMode] = useState<EditMode>("PUBLISHED")
    const mapperMetadata = useAdapterMetadataQuery(updateSubscriptionData.mapperId, {skip: !updateSubscriptionData.mapperId})
    const handlerMetadata = useAdapterMetadataQuery(updateSubscriptionData.handlerId, {skip: !updateSubscriptionData.handlerId})
    const receiverMetadata = useAdapterMetadataQuery(updateSubscriptionData.receiverId, {skip: !updateSubscriptionData.receiverId})
    const validatorMetadata = useAdapterMetadataQuery(updateSubscriptionData.validatorId, {skip: !updateSubscriptionData.validatorId})
    


    useEffect(() => {
        if (subscriptionData) {
            const normalized = structuredClone({
                id,
                ...subscriptionData,
                schedules: subscriptionData.schedules.map((s: ScheduleView, index: number) => ({
                    ...s,
                    id: index
                }))
            });
            setUpdateSubscriptionData(normalized);
            savedDataRef.current = JSON.stringify(normalized);
            setRetryPolicyMode(normalized.customRetryPolicy ? "CUSTOM" : normalized.retryPolicyId ? "NAMED" : "NONE");
        } else {
            setUpdateSubscriptionData({});
            savedDataRef.current = '{}';
            setRetryPolicyMode("NONE");
        }
    }, [subscriptionData, id]);

    const hasUnsavedChanges = JSON.stringify(updateSubscriptionData) !== savedDataRef.current;
    const onClickAggregateNow = () => {
        aggregateNow((id))
    }
    const onClickReceiveNow = () => {
        receiveNow((id))
    }

    const onClickUpdateSubscription = async () => {
        await updateSubscription({...updateSubscriptionData, id});
        savedDataRef.current = JSON.stringify(updateSubscriptionData);
        await getTrails();
    }
    const onCreateDraft = async () => {
        
        const res = await createDraftSubscription({subscriptionId: id})
        if ('data' in res) {
            setOpenModal("NONE")
        }
    }
    const onClickSaveAsDraft = async () => {
        //await updateDraftSubscription({...updateSubscriptionData, id: draftId});
        await getTrails();
    }
    const onPublishDraft = async () => {
        await updateDraftSubscription(updateSubscriptionData);
        await getTrails();
        //await publishDraft({id: draftId})
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

    const onChangeMode = (mode: EditMode) => {
        setMode(mode)
    }
    
    console.log("updateSubscriptionData", updateSubscriptionData)
    
    if (!updateSubscriptionData) return <></>
    const subscriptionType = normalizeSubscriptionType(updateSubscriptionData?.type);
    const onChangeRetryPolicyMode = (mode: string) => {
        setRetryPolicyMode(mode as typeof retryPolicyMode)
        if (mode === "NAMED") {
            onChangeSubscriptionData("customRetryPolicy", null)
        } else if (mode === "CUSTOM") {
            onChangeSubscriptionData("retryPolicyId", null)
            onChangeSubscriptionData("customRetryPolicy", updateSubscriptionData.customRetryPolicy ?? {groups: []})
        } else {
            onChangeSubscriptionData("retryPolicyId", null)
            onChangeSubscriptionData("customRetryPolicy", null)
        }
    }

    return (
        <div className="flex flex-col w-full  ">
            {
                openModal === "CREATE_DRAFT" &&
                <Dialog title={"Are you sure that you want to create a draft version for this subscription"}
                        onConfirm={onCreateDraft} onCancel={() => setOpenModal("NONE")}/>
            }

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

            <div className={"px-1 flex text-white cursor-pointer"}>
                <div onClick={() => onChangeMode("PUBLISHED")}
                     className={"px-2  text-center rounded-l" + " " + (mode == "PUBLISHED" ? " bg-primary-600 " : " font-thin bg-gray-600")}>
                    Published version
                </div>
                <div
                    onClick={() => onChangeMode("DRAFT")}
                    className={"  px-2  text-center rounded-r min-w-[100px]" + " " + (mode == "DRAFT" ? " bg-primary-600 " : "font-thin bg-gray-600")}>
                    Draft
                </div>
            </div>
            <div className={"shadow-lg bg-white rounded-lg mb-6 border  py-2  mt-3 pt-3 px-3"}>


                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    <FormField title="Name" className="grow">
                            <TextEditor value={updateSubscriptionData?.name}
                                        disabled={mode == "DRAFT"}
                                        onChange={(e) => onChangeSubscriptionData("name", e)}
                            />
                        </FormField>
                        <FormField title="Category" className="grow">
                            <ChoiceEditor
                                value={updateSubscriptionData?.categoryId?.toString()}
                                onChange={(e) => onChangeSubscriptionData("categoryId", e)}
                                optionTitle={(item) => item.code}
                                optionValue={(item) => item.id}
                                options={subscriptionCategories.data?.result ?? []}/>
                        </FormField>
                    {workGroupsAvailable && !workGroups.isLoading && workGroups.isSuccess && (
                            <FormField title="Work Group" className="grow">
                                <ChoiceEditor
                                    value={updateSubscriptionData?.workGroupId?.toString()}
                                    onChange={(e) => onChangeSubscriptionData("workGroupId", e)}
                                    optionTitle={(item) => item?.name || ''}
                                    optionValue={(item) => item?.id?.toString() || ''}
                                    options={Array.isArray(workGroups.data?.result) 
                                        ? workGroups.data.result.map(wg => ({id: wg.id, name: wg.name})) 
                                        : []}/>
                            </FormField>
                    )}
                        <FormField title="Type" className="grow">
                            <ChoiceEditor
                                disabled={true}
                                value={subscriptionType}
                                onChange={(e) => onChangeSubscriptionData("type", e)}
                                optionTitle={(item: OptionType) => item.title}
                                optionValue={(item: OptionType) => item.id}
                                options={SubscriptionTypeOptions}/>
                        </FormField>
                        <FormField title="Document" className="grow">
                            <DocumentSelector disabled={true}
                                              value={updateSubscriptionData?.documentId}
                                              onChange={(e) => onChangeSubscriptionData("documentId", e)}
                            />
                        </FormField>
                        <FormField title="Partner" className="grow">
                            <PartnerSelector disabled={true}
                                             value={updateSubscriptionData?.partnerId}
                                             onChange={(e) => onChangeSubscriptionData("partnerId", e)}
                            />
                        </FormField>
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
                    subscriptionType == String(SubscriptionType.Internal) &&
                    <MatchExpressionEditor
                        onChange={(e) => onChangeSubscriptionData("matchExpression", e)}
                        documentId={updateSubscriptionData.documentId}
                        expression={updateSubscriptionData.matchExpression}
                    />
                }
                {(!updateSubscriptionData.matchExpression && subscriptionType == String(SubscriptionType.Internal)) &&
                    <div
                        className="bg-white  border shadow-lg rounded-lg px-2 py-2 md:w-1/2">
                        <FormField title="Filters" className="grow">
                            <SubscriptionFilter
                                documentId={updateSubscriptionData.documentId}
                                onChange={(e) => onChangeSubscriptionData("documentFilter", e)}
                                documentFilter={updateSubscriptionData?.documentFilter}/>
                        </FormField>
                    </div>}
                {subscriptionType == String(SubscriptionType.Aggregation) &&
                    <div
                        className="bg-white border shadow-lg px-2 py-2 rounded-lg md:w-1/2">

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
                {(subscriptionType == String(SubscriptionType.ApiCall) || subscriptionType == String(SubscriptionType.GatewayApiCall) || subscriptionType == String(SubscriptionType.BusGateway)) &&
                    <div
                        className="bg-white border shadow-lg rounded-lg px-2 py-2 md:w-1/2">
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

                {subscriptionType == String(SubscriptionType.Receiving) &&
                    <div
                        className=" bg-white md:w-1/2 border shadow-lg rounded-lg px-2 py-2">
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

                <div className={" flex flex-col md:flex-row gap-3"}>
                    <div className=" bg-white border rounded-lg shadow-lg px-2 py-2 md:w-1/2">
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
                            suppressProps={updateSubscriptionData?.mapperId === NATIVE_JSON_MAPPER_ID}
                        />
                        {updateSubscriptionData?.mapperId === NATIVE_JSON_MAPPER_ID && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {subscriptionData?.mapperProperties?.some(
                                    (p: any) => p.key === 'ScribanTemplate' && p.value && p.value !== '{}'
                                ) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-300">
                                        ✓ Template configured
                                    </span>
                                )}
                                <Link
                                    to={`/subscriptions/${id}/mapping-editor`}
                                    className="px-3 py-1.5 text-sm border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition font-medium">
                                    ⛶ Open Mapping Editor
                                </Link>
                            </div>
                        )}
                    </div>
                    <div
                        className="bg-white border shadow-lg rounded-lg px-2 py-2 md:w-1/2">

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

                <div className="bg-white border shadow-lg rounded-lg px-2 py-2">
                    <FormField title="Retry Policy" className="grow w-64">
                        <ChoiceEditor
                            value={retryPolicyMode}
                            onChange={onChangeRetryPolicyMode}
                            optionTitle={(item: OptionType) => item.title}
                            optionValue={(item: OptionType) => item.id}
                            isClearable={false}
                            options={[
                                {id: "NONE", title: "None"},
                                {id: "NAMED", title: "Named Policy"},
                                {id: "CUSTOM", title: "Custom"},
                            ]}/>
                    </FormField>

                    {retryPolicyMode === "NAMED" &&
                        <div className={"mt-3 w-64"}>
                            <RetryPolicySelector
                                value={updateSubscriptionData.retryPolicyId?.toString()}
                                onChange={(v) => onChangeSubscriptionData("retryPolicyId", v ? Number(v) : null)}/>
                        </div>
                    }

                    {retryPolicyMode === "CUSTOM" &&
                        <RetryGroupsEditor
                            title={"Groups"}
                            groups={updateSubscriptionData.customRetryPolicy?.groups ?? []}
                            onChange={(g) => onChangeSubscriptionData("customRetryPolicy", {groups: g})}/>
                    }
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
                <div className={"flex flex-col md:flex-row"}>
                    {
                        subscriptionType == String(SubscriptionType.Aggregation) && <Authorize roles={["Admin", "Member"]}>


                            <Button className={"mx-8"} variant={"secondary"} onClick={onClickAggregateNow}
                            >
                                Aggregate Now
                            </Button>
                        </Authorize>
                    }
                    {
                        subscriptionType == String(SubscriptionType.Receiving) && <Authorize roles={["Admin", "Member"]}>
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
                    {
                        mode === "DRAFT" && <Authorize roles={["Admin", "Member"]}>
                            <Button
                                onClick={onClickSaveAsDraft}>
                                Save as draft
                            </Button>
                        </Authorize>
                    }
                    {
                        mode === "DRAFT" && <Authorize roles={["Admin", "Member"]}>
                            <Button
                                onClick={onPublishDraft}>
                                Publish
                            </Button>
                        </Authorize>
                    }

                    {mode === "PUBLISHED" && <Authorize roles={["Admin"]}>
                            <Button
                                disabled={!hasUnsavedChanges}
                                onClick={onClickUpdateSubscription}>
                                Save
                            </Button>
                        </Authorize>
                    }

                </div>

            </div>


        </div>
    );
}

export default Component;
