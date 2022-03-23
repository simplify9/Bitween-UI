import { useState } from "react";
import { DateTimeRangeEditor, DateTimeRange } from "./common/forms/DateTimeRangeEditor";
import { ChoiceEditor } from "./common/forms/ChoiceEditor";
import FormField from "./common/forms/FormField";
import Input from "./common/forms/Input";
import InputBox from "./common/forms/InputBox";
import TabNavigator from "./common/forms/TabNavigator";
import Tab from "./common/forms/Tab";


type DeliveryStatus = {
    id:string
    title:string
}


interface Props {

}

const Component = (props:Props) => {

    const [deliveryStatus, setDeliveryStatus] = useState<string | undefined>();
    const [dateRange, setDateRange] = useState<DateTimeRange>({ });

    return (
        <div className="flex flex-col w-full px-8 py-4">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Exchanges</div>
                <button className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                    Create New Exchange
                </button>
            </div>
            <TabNavigator>
                <Tab>Keyword Search</Tab>
                <Tab selected>Find By</Tab>
                <Tab>Advanced Search</Tab>
            </TabNavigator>
            <form className="flex w-full px-4 py-8">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4">

                    <FormField title="Target Subscription">
                        <InputBox>
                            <Input type="text" placeholder="Select Subscription" />
                        </InputBox>
                    </FormField>

                    <FormField title="Delivery Status">
                        <ChoiceEditor 
                            placeholder="Select Status" 
                            value={deliveryStatus} 
                            onChange={setDeliveryStatus}
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
                        <DateTimeRangeEditor value={dateRange} onChange={setDateRange} />
                    </FormField>

                    <button type="submit" className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">Find</button>
                </div>
            </form>
        </div>
    )
}

export default Component;



