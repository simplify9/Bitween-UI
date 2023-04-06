import {SubscriptionSpecs} from "../Subscriptions";
import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";
import Button from "src/components/common/forms/Button";
import {BsSearch} from "react-icons/bs"

interface Props {
    value: SubscriptionSpecs
    onChange: (value: SubscriptionSpecs) => void
    onFindRequested: () => void
    searchAdapterData?: boolean
}

export const SubscriptionFinderPanel: React.FC<Props> = ({
                                                             value,
                                                             onChange,
                                                             onFindRequested,
                                                             searchAdapterData
                                                         }) => {


    return (
        <>
            <div className="flex flex-row  px-4 ">
                <div className="flex flex-wrap items-end mb-2 space-x-4 w-full">
                    <FormField title="Name" className="grow">
                        <TextEditor placeholder="Name" value={value.nameContains}
                                    onChange={(t) => onChange({...value, nameContains: t})}
                        />
                    </FormField>
                    {
                        searchAdapterData &&
                        <FormField title="Adapter data" className="grow">
                            <TextEditor placeholder="Adapter data" value={value.rawsubscriptionproperties}
                                        onChange={(t) => onChange({...value, rawsubscriptionproperties: t})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Filter data" className="grow">
                            <TextEditor placeholder="Filter data" value={value.rawfiltersproperties}
                                        onChange={(t) => onChange({...value, rawfiltersproperties: t})}
                            />
                        </FormField>
                    }
                    
                    <Button
                        variant={"none"}
                        onClick={onFindRequested}
                    >
                        <BsSearch size={33} className={" mb-2 text-primary-600"}/>
                    </Button>
                </div>
            </div>


        </>
    )
}



