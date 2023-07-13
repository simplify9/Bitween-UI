import TextEditor from "../common/forms/TextEditor";
import FormField from "../common/forms/FormField";
import {useState} from "react";
import Modal from "../common/Modal";


interface Props {
    onClose: () => void
    onAdd: (name: string) => void
}


const Component: React.FC<Props> = ({onClose, onAdd}) => {

    const [name, setName] = useState('');


    return (
        <Modal onClose={onClose} submitLabel={"Add"} onSubmit={() => onAdd(name)}
               submitDisabled={name == '' ? true : false}>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title">New Partner</h3>
                <div className="mt-4">
                    <FormField title="Please enter the name of the partner" className="grow">
                        <TextEditor placeholder="Type in the name..." value={name} onChange={(t) => setName(t)}/>
                    </FormField>
                </div>
            </div>
        </Modal>
    )
}

export default Component;
