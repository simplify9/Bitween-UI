import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import {useCreateNotifierMutation} from "@/src/client/apis/notifiersApi";
import {useNavigate} from "react-router-dom";

type Props = {
    onClose: () => void
}
const CreateNotifierModal: React.FC<Props> = ({onClose}) => {
    const [createNotifier, response] = useCreateNotifierMutation()
    const [name, setName] = useState("");
    const nav = useNavigate()
    const onCreate = () => {
        if (name && name.length > 0) {
            createNotifier({name})
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

export default CreateNotifierModal