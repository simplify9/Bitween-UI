import Modal from "src/components/common/Modal";
import React, {useState} from "react";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import DocumentSelector from "src/components/Documents/DocumentSelector";
import {useCreateBusGatewayMutation} from "src/client/apis/busGatewaysApi";
import {useNavigate} from "react-router-dom";

type Props = {
    onClose: () => void
}

const CreateBusGatewayModal: React.FC<Props> = ({onClose}) => {
    const [createBusGateway] = useCreateBusGatewayMutation();
    const [name, setName] = useState("");
    const [documentId, setDocumentId] = useState<string>("");
    const nav = useNavigate();

    const onCreate = async () => {
        if (!name.trim() || !documentId) return;
        const result = await createBusGateway({name, documentId: Number(documentId)});
        if ('data' in result && result.data?.id) {
            onClose();
            nav(`/bus-gateways/${result.data.id}`);
        }
    }

    return (
        <Modal onClose={onClose} submitLabel="Create" onSubmit={onCreate}>
            <FormField title="Name" className="grow">
                <TextEditor value={name} onChange={setName} placeholder="e.g. order-gateway"/>
            </FormField>
            <FormField title="Document" className="grow">
                <DocumentSelector value={documentId} onChange={setDocumentId}/>
            </FormField>
        </Modal>
    );
}

export default CreateBusGatewayModal;
