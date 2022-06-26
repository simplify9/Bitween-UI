import { ChoiceEditor } from "../common/forms/ChoiceEditor"
import { DateTimeRange, DateTimeRangeEditor } from "../common/forms/DateTimeRangeEditor"
import FormField from "../common/forms/FormField"
import TextEditor from "../common/forms/TextEditor"
import SubscriptionSelector from "../Subscriptions/SubscriptionSelector"


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
    onFindRequested: () => void
}

export const ExchangeFindBy:React.FC<Props> = ({ value, onChange, onFindRequested }) => {

    const handleFind = (e:any) => {
        e.preventDefault();
        onFindRequested();
    }

    return (
        <div className="flex w-full px-4 py-8" >
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
                            { id: "0", title: "Running" },
                            { id: "1", title: "Success" },
                            { id: "2", title: "Bad response"},
                            { id: "3", title: "Failed" }
                        ]} />
                </FormField>

                <FormField title="Creation Time Window">
                    <DateTimeRangeEditor

                        value={value.creationTimeWindow}
                        onChange={creationTimeWindow => onChange({ ...value, creationTimeWindow })} />
                </FormField>

                <button
                    onClick={handleFind}
                    className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                    Find
                </button>
            </div>
        </div>
    )
}

