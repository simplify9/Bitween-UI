import TextEditor from "../common/forms/TextEditor";
import FormField from "../common/forms/FormField";
import {useState} from "react";
import Modal from "../common/Modal";
import {ICreateSubscription, SubscriptionTypeOptions} from "../../types/subscriptions";
import {ChoiceEditor} from "../common/forms/ChoiceEditor";
import {OptionType} from "../../types/common";
import DocumentSelector from "../Documents/DocumentSelector";
import PartnerSelector from "../Partners/PartnerSelector";
import SubscriptionSelector from "./SubscriptionSelector";


interface Props {
    onClose: () => void
    onAdd: (req: ICreateSubscription) => void
}


const Component: React.FC<Props> = ({onClose, onAdd}) => {

    const [newSubscription, setNewSubscription] = useState<ICreateSubscription>({});


    return (
        <Modal onClose={onClose} submitLabel={"Add"} onSubmit={() => onAdd(newSubscription)}>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left grow">
                <h3 className="text-lg  font-medium text-gray-900"
                    id="modal-title">New Subscription</h3>
                {newSubscription.type != "8" && <div className="mt-4">
                    <FormField title="Document" className="grow">
                        <DocumentSelector value={newSubscription.documentId}
                                          onChange={val => setNewSubscription({...newSubscription, documentId: val})}/>
                    </FormField>
                </div>}
                {newSubscription.type != "4" && <div className="mt-4">
                    <FormField title="Partner" className="grow">
                        <PartnerSelector value={newSubscription.partnerId}
                                         onChange={val => setNewSubscription({...newSubscription, partnerId: val})}/>
                    </FormField>
                </div>}
                {newSubscription.type == "8" && <div className="mt-4">
                    <FormField title="Aggregated for" className="grow">
                        <SubscriptionSelector value={newSubscription.aggregationForId}
                                              onChange={val => setNewSubscription({
                                                  ...newSubscription,
                                                  aggregationForId: val
                                              })}/>
                    </FormField>
                </div>}
                <div className="mt-4">
                    <FormField title="Subscription Type" className="grow">
                        <ChoiceEditor
                            placeholder="Select Subscription Type"
                            value={newSubscription.type}
                            onChange={val => setNewSubscription({...newSubscription, type: val})}
                            optionTitle={(item: OptionType) => item.title}
                            optionValue={(item: OptionType) => item.id}
                            options={SubscriptionTypeOptions}/>
                    </FormField>
                </div>
                <div className="mt-4">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Type in the name..." value={newSubscription.name}
                                    onChange={(t) => setNewSubscription({...newSubscription, name: t})}/>

                    </FormField>
                </div>

            </div>
        </Modal>
    )
}

export default Component;
