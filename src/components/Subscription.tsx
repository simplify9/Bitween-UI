import {useNavigate, useParams} from "react-router-dom";
import Button from "./common/forms/Button";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import {useCallback, useEffect, useState} from "react";
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

const Component = () => {
    let navigate = useNavigate();
    let {id} = useParams();
    const [openModal, setOpenModal] = useState<"NONE" | "TRAIL">("NONE");
    const [subscription, setSubscription] = useState<ISubscription>({});
    const [subscriptionTrail, setSubscriptionTrail] = useState<TrailBaseModel[]>([]);

    const [updateSubscriptionData, setUpdateSubscriptionData] = useState<ISubscription>({});

    useEffect(() => {
        if (id) {
            refreshSubscription(id).then();
        }
    }, [id]);

    const refreshSubscription = async (id: string) => {
        let res = await apiClient.findSubscription(id);
        if (res.succeeded) {
            const data = {
                ...res.data,
                schedules: res.data.schedules.map((s: ScheduleView, index: number) => ({
                    ...s,
                    id: index
                }))
            }
            setSubscription(data);
            setUpdateSubscriptionData(data)
        }
    }

    const updateSubscription = async () => {
        let res = await apiClient.updateSubscription(id!, updateSubscriptionData!);
        if (res.succeeded) {
            await refreshSubscription(id!);
            await getTrails();
        }
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

    if (!subscription) return <></>

    return (
        <div className="flex flex-col w-full px-8 py-10">
            {
                openModal === "TRAIL" &&
                <TrialsViewModal data={subscriptionTrail} onClose={() => setOpenModal("NONE")}/>
            }
            <div className="justify-between w-full flex py-4">
                <div
                    className="text-2xl font-bold tracking-wide text-gray-700">
                    Subscriptions
                </div>
                <div className={"flex gap-2"}>

                    <Button onClick={() => {
                        getTrails()
                        setOpenModal("TRAIL")
                    }}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded">
                        Trail
                    </Button>
                    <Button onClick={deleteSubscription}
                            className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded">
                        Delete
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-5 rounded mb-6 border px-2 py-2 shadow">
                <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
                    <FormField title="ID" className="grow">
                        <TextEditor disabled={true} value={id}/>
                    </FormField>
                </div>
                <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
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

                <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
                    <FormField title="Document" className="grow">
                        <DocumentSelector disabled={true}
                                          value={updateSubscriptionData?.documentId}
                                          onChange={(e) => onChangeSubscriptionData("documentId", e)}
                        />
                    </FormField>
                </div>

                <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
                    <FormField title="Partner" className="grow">
                        <PartnerSelector disabled={true}
                                         value={updateSubscriptionData?.partnerId}
                                         onChange={(e) => onChangeSubscriptionData("partnerId", e)}


                        />
                    </FormField>
                </div>

                <div className=" ">
                    <FormField title="Name" className="grow">
                        <TextEditor value={updateSubscriptionData?.name}
                                    onChange={(e) => onChangeSubscriptionData("name", e)}
                        />
                    </FormField>
                </div>


            </div>


            <div className="flex flex-col gap-6 rounded mb-6 ">

                {
                    updateSubscriptionData?.type == "1" &&
                    <MatchExpressionEditor expression={subscription.matchExpression}
                                           expressionString={subscription.matchExpressionAsString}/>
                }
                {updateSubscriptionData?.type == "1" &&
                    <div
                        className=" border shadow px-2 py-2">
                        <FormField title="Filters" className="grow">
                            <SubscriptionFilter
                                documentId={subscription.documentId}
                                onChange={(e) => onChangeSubscriptionData("documentFilter", e)}
                                documentFilter={updateSubscriptionData?.documentFilter}/>
                        </FormField>
                    </div>}
                {updateSubscriptionData?.type == "8" &&
                    <div
                        className=" border shadow px-2 py-2">

                        <FormField title="Aggregation" className="grow">
                        </FormField>
                        <FormField title="Subscription">
                            <SubscriptionSelector
                                value={updateSubscriptionData.aggregationForId}
                                onChange={() => {
                                }}
                                disabled={true}
                            />
                        </FormField>


                        <div className={"mt-5"}>

                            <ScheduleEditor title={"Schedule"}
                                            onChangeSchedules={(e) => onChangeSubscriptionData("schedules", e)}

                                            schedule={updateSubscriptionData.schedules}/>
                        </div>


                    </div>}
                {updateSubscriptionData?.type == "2" &&
                    <div
                        className=" border shadow px-2 py-2">

                        <AdapterEditor title={"Validator"} type={"validators"}
                                       value={updateSubscriptionData?.validatorId}
                                       onChange={(t) => setUpdateSubscriptionData({
                                           ...updateSubscriptionData,
                                           validatorId: t
                                       })}
                                       props={updateSubscriptionData?.validatorProperties}
                        />


                    </div>}
                {updateSubscriptionData?.type == "4" &&
                    <div
                        className=" border shadow px-2 py-2">

                        <AdapterEditor title={"Receiver"} type={"receivers"}
                                       value={updateSubscriptionData?.receiverId}
                                       onChange={(t) => setUpdateSubscriptionData({
                                           ...updateSubscriptionData,
                                           receiverId: t
                                       })}
                                       props={updateSubscriptionData?.receiverProperties}
                        />
                        <ScheduleEditor title={"Schedule"}
                                        onChangeSchedules={(e) => onChangeSubscriptionData("schedules", e)}

                                        schedule={updateSubscriptionData.schedules}/>

                    </div>}

                <div className={"flex flex-row gap-3"}>
                    <div
                        className=" border shadow px-2 py-2 w-1/2">

                        <AdapterEditor title={"Mapper"} type={"mappers"}
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
                        className=" border shadow px-2 py-2 w-1/2">

                        <AdapterEditor title={"Handler"} type={"handlers"}
                                       value={updateSubscriptionData?.handlerId}
                                       onChange={(t) => setUpdateSubscriptionData({
                                           ...updateSubscriptionData,
                                           handlerId: t
                                       })}
                                       onPropsChange={(e) => onChangeSubscriptionData("handlerProperties", e)}
                                       props={updateSubscriptionData?.handlerProperties}
                        />


                    </div>
                </div>


            </div>


            <div className={"flex w-full gap-2"}>
                <Button
                    onClick={() => navigate('/subscriptions')}
                    className="text-white bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center">Cancel
                </Button>
                <Button
                    onClick={updateSubscription}
                    className="text-white bg-blue-800 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center">Save
                </Button>
            </div>


        </div>
    );
}

export default Component;
