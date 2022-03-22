import { useState } from "react";
import { DateTimeRangeInput, DateTimeRange } from "./common/forms/DateTimeRangeInput";
import FormField from "./common/forms/FormField";
import Input from "./common/forms/Input";
import InputBox from "./common/forms/InputBox";


interface Props {

}

const Component = (props:Props) => {

    const [dateRange, setDateRange] = useState<DateTimeRange>({ from: undefined, to: undefined })

    return (
        <div className="flex flex-col w-full px-8 py-4">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Exchanges</div>
                <button className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                    Create New Exchange
                </button>
            </div>
            <div className="flex w-full shadow-b-2 shadow-gray-200">
                <label className="first:ml-0 ml-4 py-1 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer">Keyword Search</label>
                <label className="first:ml-0 ml-4 py-1 text-sm font-medium shadow-b-2 shadow-teal-500 cursor-default">Find By</label>
                <label className="first:ml-0 ml-4 py-1 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer">Advanced Search</label>
            </div>
            <form className="flex w-full px-4 py-8">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4">

                    <FormField title="Target Subscription">
                        <InputBox>
                            <Input type="text" placeholder="Select Subscription" />
                        </InputBox>
                    </FormField>

                    <FormField title="Delivery Status">
                         <InputBox>
                            <Input type="text" placeholder="Select Status" />
                        </InputBox>
                    </FormField>

                    <FormField title="Creation Time Window">
                        <DateTimeRangeInput value={dateRange} onChange={setDateRange} />
                    </FormField>

                    <button type="submit" className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">Find</button>
                </div>
            </form>
        </div>
    )
}

export default Component;



