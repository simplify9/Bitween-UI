import {useNavigate, useParams} from "react-router-dom";
import {useLazyRetryPolicyQuery, useUpdateRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import React, {useEffect, useState} from "react";
import {RetryPolicyModel} from "src/types/retryPolicies";
import RetryGroupsEditor from "src/components/RetryPolicies/RetryGroupsEditor";
import TestRetryPolicyModal from "src/components/RetryPolicies/TestRetryPolicyModal";
import {MdPlayCircleOutline} from "react-icons/md";

const RetryPolicy = () => {

    const nav = useNavigate()
    const [data, setData] = useState<RetryPolicyModel>()
    const [testModalVisible, setTestModalVisible] = useState(false)
    const {id} = useParams() as { id: string }
    const [fetch] = useLazyRetryPolicyQuery()
    const [update] = useUpdateRetryPolicyMutation()

    const fetchData = async () => {
        const result = await fetch(Number(id))
        if (result.isSuccess) {
            setData({...result.data, id: Number(id)})
        }
    }

    const onUpdate = () => {
        if (data) update({...data, id: Number(id)})
    }

    useEffect(() => {
        fetchData()
    }, [id]);

    const onChange = (key: keyof RetryPolicyModel, value: any) => {
        setData((d) => ({...d, [key]: value} as RetryPolicyModel))
    }

    if (!data)
        return <></>;

    return <div className={"flex flex-col w-full md:w-[900px] mt-3"}>
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

        <div className={"bg-white p-2 rounded-lg shadow-lg mt-5"}>
            <RetryGroupsEditor title={"Groups"} groups={data.groups}
                                onChange={(g) => onChange("groups", g)}/>
        </div>

        <div className={"flex w-full flex-row-reverse gap-2 mt-8"}>
            <Authorize roles={["Admin", "Member"]}>
                <Button onClick={onUpdate}>Save</Button>
            </Authorize>

            <Button variant={"secondary"} onClick={() => nav('/retry-policies')}>Cancel</Button>
        </div>
    </div>
}

export default RetryPolicy
