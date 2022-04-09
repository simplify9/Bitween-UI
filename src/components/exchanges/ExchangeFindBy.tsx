import { ChoiceEditor } from "../common/forms/ChoiceEditor"
import { DateTimeRange, DateTimeRangeEditor } from "../common/forms/DateTimeRangeEditor"
import FormField from "../common/forms/FormField"
import TextEditor from "../common/forms/TextEditor"
import SubscriptionSelector from "../subscriptions/SubscriptionSelector"


type DeliveryStatus = {
    id:string
    title:string
}

export type ExchangeFindBySpecs = {
    subscription: string
    status: string
    creationTimeWindow: DateTimeRange
}

interface Props {
    value: ExchangeFindBySpecs
    onChange: (value: ExchangeFindBySpecs) => void
    onFindRequested: (value: ExchangeFindBySpecs) => void
}

export const ExchangeFindBy:React.FC<Props> = ({ value, onChange, onFindRequested }) => {

    const handleFind = (e:any) => {
        e.preventDefault();
        onFindRequested(value);
    }

    return (
        <form noValidate className="flex w-full px-4 py-8" onSubmit={handleFind}>
            <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4">
                <FormField title="Target Subscription">
                    <SubscriptionSelector 
                        value={value.subscription} 
                        onChange={subscription => onChange({ ...value, subscription })} />
                </FormField>

                <FormField title="Delivery Status">
                    <ChoiceEditor 
                        placeholder="Select Status" 
                        value={value.status} 
                        onChange={status => onChange({ ...value, status })}
                        optionTitle={(item:DeliveryStatus) => item.title}
                        optionValue={(item:DeliveryStatus) => item.id}
                        options={[
                            { id: "received", title: "Received" }, 
                            { id: "mapped", title: "Mapped" },
                            { id: "delivered", title: "Delivered"},
                            { id: "failed", title: "Failed" } 
                        ]} />
                </FormField>

                <FormField title="Creation Time Window">
                    <DateTimeRangeEditor 
                        
                        value={value.creationTimeWindow} 
                        onChange={creationTimeWindow => onChange({ ...value, creationTimeWindow })} />
                </FormField>

                <button 
                    type="submit" 
                    className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                    Find
                </button>
            </div>
        </form>
    )
}

