import {useNavigate, useParams} from "react-router-dom";
import {useLazyRetryPolicyQuery, useUpdateRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import React, {useEffect, useState} from "react";
import {RetryPolicyModel, pairsFromRecord, recordFromPairs} from "src/types/retryPolicies";
import RetryGroupsEditor from "src/components/RetryPolicies/RetryGroupsEditor";
import RetryPolicySubscriptions from "src/components/RetryPolicies/RetryPolicySubscriptions";
import TestRetryPolicyModal from "src/components/RetryPolicies/TestRetryPolicyModal";
import AdapterEditor from "src/components/Subscriptions/AdapterEditor";
import {MdPlayCircleOutline} from "react-icons/md";

const RetryPolicy = () => {

    const nav = useNavigate()
    const [data, setData] = useState<RetryPolicyModel>()
    const [saved, setSaved] = useState<RetryPolicyModel>()
    const [testModalVisible, setTestModalVisible] = useState(false)
    const {id} = useParams() as { id: string }
    const [fetch] = useLazyRetryPolicyQuery()
    const [update] = useUpdateRetryPolicyMutation()

    const fetchData = async () => {
        const result = await fetch(Number(id))
        if (result.isSuccess) {
            setData({...result.data, id: Number(id)})
            setSaved({...result.data, id: Number(id)})
        }
    }

    const onUpdate = async () => {
        if (!data) return
        await update({...data, id: Number(id)})
        setSaved(data)
    }

    const onDiscard = () => setData(saved)

    useEffect(() => {
        fetchData()
    }, [id]);

    const onChange = (key: keyof RetryPolicyModel, value: any) => {
        setData((d) => ({...d, [key]: value} as RetryPolicyModel))
    }

    const changed = !!data && !!saved && JSON.stringify(data) !== JSON.stringify(saved)

    if (!data)
        return <></>;

    // Everything on one page and all three tables on screen at once: the two config blocks share a
    // row so the width beside them is not wasted, and the subscriptions table takes the full width
    // below with its own scroll, so the layout never moves as rows pile up.
    return <div className={"flex flex-col w-full mt-3"}>
        {testModalVisible &&
            <TestRetryPolicyModal groups={data.groups} onClose={() => setTestModalVisible(false)}/>}

        <div className={"flex flex-row items-end justify-between gap-3"}>
            <FormField title="Name" className="grow">
                <TextEditor value={data?.name} onChange={(t) => onChange("name", t)}/>
            </FormField>
            <Button variant={"secondary"} onClick={() => setTestModalVisible(true)}>
                <span className="inline-flex items-center gap-1.5">
                    <MdPlayCircleOutline size={18}/>
                    Test policy
                </span>
            </Button>
        </div>

        {/* Groups spans the width: eight columns need it, and it is only a few rows tall. */}
        <div className={"bg-white p-2 rounded-lg shadow-lg mt-5"}>
            <RetryGroupsEditor title={"Groups"} groups={data.groups}
                               onChange={(g) => onChange("groups", g)}
                               policyAlertHandlerId={data.alertHandlerId}
                               policyAlertHandlerProperties={data.alertHandlerProperties}/>
        </div>

        {/* The alert card is tall — one row per handler property — so it sits beside the one other
            tall thing on the page rather than beside the short Groups card, where it left a gap.
            Neither card is height-capped: a form that scrolls inside a box reads as broken, while a
            long data table that scrolls is ordinary, so only the table below caps itself. */}
        <div className={"grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-5 mt-5"}>
            <div className={"bg-white p-2 rounded-lg shadow-lg min-w-0"}>
                <RetryPolicySubscriptions policyId={Number(id)}/>
            </div>

            <div className={"bg-white p-2 rounded-lg shadow-lg min-w-0"}>
                <FormField title="Budget exhausted alert"
                           tooltip="The policy default, inherited by every group and subscription that does not set its own. Sent once when a group's 'max attempts total' runs out for a subscription, and not again until that budget is reset.">
                    <p className={"text-xs text-gray-500 mb-2"}>
                        Used unless a group or a single subscription overrides it. Empty sends nothing.
                    </p>
                    <AdapterEditor title={"Alert handler"} type={"handlers"}
                                   value={data.alertHandlerId}
                                   onChange={(v) => onChange("alertHandlerId", v)}
                                   props={pairsFromRecord(data.alertHandlerProperties)}
                                   onPropsChange={(p) => onChange("alertHandlerProperties", recordFromPairs(p))}/>
                </FormField>
            </div>
        </div>

        {/* Cancel stays put; Save lives only in the bar below so it is never in two places at once. */}
        <div className={"flex w-full flex-row-reverse gap-2 mt-8"}>
            <Button variant={"secondary"} onClick={() => nav('/retry-policies')}>Cancel</Button>
        </div>

        {/* Appears only once the policy actually differs from what is stored, and then follows the
            page, so an edit made at the top cannot be forgotten while reading the bottom. Resets and
            alert overrides are not here: those apply the moment they are clicked. */}
        {changed &&
            <div className={"sticky bottom-0 z-20 flex flex-row items-center justify-between gap-3 mt-3 -mx-1 px-4 py-3 bg-white border-t shadow-[0_-2px_8px_rgba(0,0,0,0.08)] rounded-b-lg"}>
                <span className={"text-sm text-gray-700"}>Unsaved changes to this policy.</span>
                <div className={"flex flex-row items-center gap-2"}>
                    <Button variant={"none"} className={"text-sm text-gray-600 hover:underline px-2"}
                            onClick={onDiscard}>
                        Discard
                    </Button>
                    <Authorize roles={["Admin", "Member"]}>
                        <Button onClick={onUpdate}>Save</Button>
                    </Authorize>
                </div>
            </div>}

    </div>
}

export default RetryPolicy
