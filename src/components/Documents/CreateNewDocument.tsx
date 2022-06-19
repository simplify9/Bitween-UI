import TextEditor from "../common/forms/TextEditor";
import FormField from "../common/forms/FormField";
import {useState} from "react";
import Modal from "../common/Modal";
import {CreateDocument} from "../../types/document";


interface Props {
    onClose: () => void
    onAdd: (document: CreateDocument) => void
}


const Component: React.FC<Props> = ({onClose, onAdd}) => {

    const [document, setDocument] = useState<CreateDocument>({});

    return (
        <Modal onClose={onClose} submitLabel={"Add"} onSubmit={() => onAdd(document)}
               submitDisabled={document.name == '' ? true : false}>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title">New Document</h3>
                <div className="mt-4">
                    <FormField title="Please enter the ID of the document" className="grow">
                        <TextEditor placeholder="Type in the id..." value={document.id} onChange={(t) => setDocument({...document,id:t})}/>
                    </FormField>
                </div>
                <div className="mt-4">
                    <FormField title="Please enter the name of the document" className="grow">
                        <TextEditor placeholder="Type in the name..." value={document.name} onChange={(t) => setDocument({...document,name: t})}/>
                    </FormField>
                </div>

            </div>
        </Modal>
    )
}

export default Component;
