import React, {useState} from "react";
import Modal from "src/components/common/Modal";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import RetryGroupsEditor from "src/components/RetryPolicies/RetryGroupsEditor";
import {useCreateRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import {RetryGroup} from "src/types/retryPolicies";
import {apiErrorMessage} from "src/client/apis/apiError";

interface Props {
    /** Suggested name, so a policy made for one subscription is recognisable in the list later. */
    suggestedName?: string
    onCreated: (id: number) => void
    onClose: () => void
}

// Creates a real, named policy from wherever one is being picked, rather than sending the reader to
// the policies page and back — a subscription being edited would lose what has been typed so far.
//
// It is a named policy on purpose. The alternative used to be an inline policy stored on the
// subscription, which no page listed and no reset could reach: once its budget ran out that
// subscription stopped retrying for good.
const NewRetryPolicyModal: React.FC<Props> = ({suggestedName, onCreated, onClose}) => {

    const [name, setName] = useState(suggestedName ?? "")
    const [groups, setGroups] = useState<RetryGroup[]>([])
    const [error, setError] = useState<string>()
    const [create, {isLoading}] = useCreateRetryPolicyMutation()

    const onSubmit = async () => {
        try {
            const result = await create({name, groups}).unwrap()
            onCreated(result.id)
        } catch (e) {
            // Kept open with the groups intact: the server rejects a group that could never fire, and
            // that is worth fixing here rather than starting again.
            setError(apiErrorMessage(e, "Could not create this policy."))
        }
    }

    return (
        <Modal onClose={onClose} submitLabel={"Create"} onSubmit={onSubmit}
               submitDisabled={!name.trim() || isLoading}>
            {error &&
                <p className={"text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3"}>
                    {error}
                </p>}

            <FormField title="Name"
                       tooltip="Shown wherever this policy can be selected, so name it after what it is for rather than after one subscription.">
                <TextEditor value={name} onChange={setName}/>
            </FormField>

            <p className={"text-xs text-gray-500 mt-2"}>
                Creating it here selects it for this subscription. It can be reused by others, and
                edited later on the retry policies page.
            </p>

            <div className={"mt-3"}>
                <RetryGroupsEditor title={"Groups"} groups={groups} onChange={setGroups}/>
            </div>
        </Modal>
    );
}

export default NewRetryPolicyModal;
