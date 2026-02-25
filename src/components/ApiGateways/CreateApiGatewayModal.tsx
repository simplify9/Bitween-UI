import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {useCreateApiGatewayMutation} from "src/client/apis/apiGatewaysApi";
import {useNavigate} from "react-router-dom";

type Props = {
    onClose: () => void
}

const CreateApiGatewayModal: React.FC<Props> = ({onClose}) => {
    const [createApiGateway] = useCreateApiGatewayMutation();
    const [name, setName] = useState("");
    const [urlName, setUrlName] = useState("");
    const nav = useNavigate();

    const onCreate = async () => {
        if (!name.trim() || !urlName.trim()) return;
        const result = await createApiGateway({name, urlName});
        if ('data' in result && result.data?.id) {
            onClose();
            nav(`/api-gateways/${result.data.id}`);
        }
    }

    return (
        <Modal onClose={onClose} submitLabel="Create" onSubmit={onCreate}>
            <FormField title="Name" className="grow">
                <TextEditor value={name} onChange={setName}/>
            </FormField>
            <FormField title="URL Name" className="grow">
                <TextEditor value={urlName} onChange={setUrlName} placeholder="e.g. my-gateway"/>
            </FormField>
        </Modal>
    );
}

export default CreateApiGatewayModal;
