import {useNavigate, useParams} from "react-router-dom";
import {useLazyNotifierQuery, useUpdateNotifierMutation} from "../client/apis/notifiersApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import React, {useEffect, useState} from "react";
import {NotifierModel} from "src/types/notifiers";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import AdapterEditor from "src/components/Subscriptions/AdapterEditor";
import SubscriptionSelector from "src/components/Subscriptions/SubscriptionSelector";
import {useSubscriptionsQuery} from "src/client/apis/subscriptionsApi";
import {ISubscription} from "src/types/subscriptions";

const Notifier = () => {

    const nav = useNavigate()
    const [data, setData] = useState<NotifierModel>()
    const {id} = useParams() as { id: string }
    const [fetch] = useLazyNotifierQuery()
    const [update] = useUpdateNotifierMutation()
    const subscriptions = useSubscriptionsQuery({limit: 200, offset: 1})
    const fetchData = async () => {
        const data = await fetch(id)
        if (data.isSuccess) {
            setData(data.data)
        }

    }
    const onUpdate = () => {
        update(data)
    }
    useEffect(() => {
        fetchData()
    }, [id]);

    const onChange = (key: keyof NotifierModel, value: any) => {
        setData({
            ...data,
            [key]: value
        })
    }

    if (!data)
        return <></>;

    return <div className="flex flex-col w-full px-8 py-5 md:w-[650px]">
        <div className="justify-between w-full flex py-4">
            <div className="text-2xl font-bold tracking-wide text-gray-700 ">Notifers</div>
            <div className={"flex gap-2"}>


            </div>
        </div>
        <div className="  w-full mt-3 group">
            <FormField title="ID" className="grow">
                <TextEditor disabled={true} value={id}/>
            </FormField>
        </div>
        <div className="  w-full mt-3 flex flex-col  gap-5">
            <FormField title="Name" className="grow">
                <TextEditor value={data?.name} onChange={(t) => onChange("name", t)}/>
            </FormField>
            <FormField title="Run options" className="grow">

                <CheckBoxEditor label={'Run successful result'} onChange={(e) => onChange("runOnSuccessfulResult", e)}
                                checked={data.runOnSuccessfulResult ?? false}/>
                <CheckBoxEditor label={'Run on failed result'} onChange={(e) => onChange("runOnFailedResult", e)}
                                checked={data.runOnFailedResult ?? false}/>
                <CheckBoxEditor label={'Run on bad result'} onChange={(e) => onChange("runOnBadResult", e)}
                                checked={data.runOnBadResult ?? false}/>
            </FormField>


        </div>
        <div className={"mt-3"}>
            <FormField title=" Subscriptions" className={"min-w-[350px]"}>
                <SubscriptionSelector
                    // value={data.runOnSubscriptions}
                    onChange={subscription => onChange("runOnSubscriptions", [...(data.runOnSubscriptions ?? []), {id: Number(subscription)}])}/>
            </FormField>

            <div className={"flex flex-col gap-3 mt-2"}>
                {
                    data.runOnSubscriptions?.map(i => {
                        const sub = subscriptions.data.result.find((s: ISubscription) => s.id === i.id)
                        return <div className={" border-b "}>
                            - {sub?.id} {sub?.name}
                        </div>
                    })
                }
            </div>
        </div>

        <div
            className="w-full border shadow px-2 py-2 mt-3">

            <AdapterEditor title={"Handler"} type={"handlers"}
                           value={data?.handlerId}
                           onChange={(t) => onChange("handlerId", t)}
                           onPropsChange={(e) => onChange("handlerProperties", e)}
                           props={data.handlerProperties}
            />


        </div>


        <div className={"flex w-full gap-2 mt-8"}>
            <Button
                onClick={() => nav('/notifiers')}
                className="text-white bg-gray-500 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center">Cancel
            </Button>
            <Authorize roles={["Admin", "Editor"]}>
                <Button
                    onClick={onUpdate}
                    className="text-white bg-blue-800 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center">Save
                </Button>
            </Authorize>
        </div>


    </div>
}

export default Notifier