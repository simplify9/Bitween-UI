import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {useCreateRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import {useNavigate} from "react-router-dom";

type Props = {
    onClose: () => void
}
const CreateRetryPolicyModal: React.FC<Props> = ({onClose}) => {
    const [createRetryPolicy, response] = useCreateRetryPolicyMutation()
    const [name, setName] = useState("");
    const nav = useNavigate()
    const onCreate = () => {
        if (name && name.length > 0) {
            createRetryPolicy({name, groups: []})
        }
    }

    useEffect(() => {
        if (response.data?.id) {
            nav(response.data.id.toString())
        }
    }, [response.isSuccess, response.data]);

    return <Modal onClose={onClose} submitLabel={"Create"} onSubmit={onCreate}>
        <FormField title="Name" className="grow">
            <TextEditor value={name} onChange={(t) => setName(t)}/>
        </FormField>
    </Modal>
}

export default CreateRetryPolicyModal
