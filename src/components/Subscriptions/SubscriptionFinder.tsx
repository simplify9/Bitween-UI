import FormField from "../common/forms/FormField";
import TextEditor from "../common/forms/TextEditor";
import React from "react";
import PartnerSelector from "src/components/Partners/PartnerSelector";
import {SubscriptionFindQuery, SubscriptionTypes} from "src/types/subscriptions";
import AdapterSelector from "src/components/Subscriptions/AdapterSelector";
import ChoiceEditor from "src/components/common/forms/ChoiceEditor";
import {useSubscriptionCategoriesQuery} from "src/client/apis/subscriptionsApi";
import DocumentSelector from "src/components/Documents/DocumentSelector";

interface Props {
    value: SubscriptionFindQuery
    onChange: (value: SubscriptionFindQuery) => void
    onFindRequested: () => void
    searchAdapterData?: boolean
}

export const SubscriptionFinderPanel: React.FC<Props> = ({
                                                             value,
                                                             onChange,
                                                             onFindRequested,
                                                             searchAdapterData
                                                         }) => {

    const subscriptionCategories = useSubscriptionCategoriesQuery({limit: 1000, offset: 0})

    return (
        <>
            <div className="flex  md:px-4  w-full">
                <div className="grid md:grid-cols-5 md:gap-x-5 gap-y-2 w-full">
                    {
                        searchAdapterData && <FormField title="Name" className="grow  md:mr-2">
                            <TextEditor placeholder="Name" value={value.nameContains}
                                        onChange={(t) => onChange({...value, nameContains: t})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData && <FormField title="Id" className="grow  md:mr-2">
                            <TextEditor placeholder="Id" value={value.id}
                                        onChange={(t) => onChange({...value, id: Number(t)})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Adapter Properties" className="grow md:mr-2">
                            <TextEditor placeholder="Adapter data" value={value.rawsubscriptionproperties}
                                        onChange={(t) => onChange({...value, rawsubscriptionproperties: t})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Filter Properties" className="grow md:mr-2">
                            <TextEditor placeholder="Filter data" value={value.rawfiltersproperties}
                                        onChange={(t) => onChange({...value, rawfiltersproperties: t})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Partner" className="grow ">
                            <PartnerSelector value={value.partnerId}
                                             onChange={val => onChange({...value, partnerId: val})}/>

                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Document" className="grow ">
                            <DocumentSelector value={value.documentId?.toString()}
                                              onChange={val => onChange({...value, documentId: Number(val)})}/>

                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Validator" className=" grow ">
                            <AdapterSelector type={'validators'} value={value.validatorId}
                                             onChange={(val) => onChange({...value, validatorId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Receiver" className="grow">
                            <AdapterSelector type={'receivers'} value={value.receiverId}
                                             onChange={(val) => onChange({...value, receiverId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Mapper" className="grow">
                            <AdapterSelector type={'mappers'} value={value.mapperId}
                                             onChange={(val) => onChange({...value, mapperId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Handler" className="grow">
                            <AdapterSelector type={'handlers'} value={value.handlerId}
                                             onChange={(val) => onChange({...value, handlerId: val})}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Type" className="grow">
                            <ChoiceEditor value={value.type?.toString()}
                                          options={SubscriptionTypes}
                                          optionValue={o => o.value}
                                          optionTitle={i => i.label}
                                          onChange={(val) => onChange({...value, type: Number(val)})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Category" className="grow">
                            <ChoiceEditor
                                value={value?.categoryId?.toString()}
                                onChange={(val) => onChange({...value, categoryId: Number(val)})}
                                optionTitle={(item) => item.code}
                                optionValue={(item) => item.id}
                                options={subscriptionCategories.data?.result ?? []}/>
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="State" className="grow">
                            <ChoiceEditor value={value.type?.toString()}
                                          options={[
                                              {value: undefined, label: 'All'},
                                              {value: 'Idle', label: 'Idle'},
                                              {value: 'Running', label: 'Running'},

                                          ]}
                                          optionValue={o => o.value}
                                          optionTitle={i => i.label}
                                          onChange={(val) => onChange({...value, isRunning: val === 'Running'})}
                            />
                        </FormField>
                    }
                    {
                        searchAdapterData &&
                        <FormField title="Status" className="grow">
                            <ChoiceEditor value={value.inactive?.toString()}
                                          options={[
                                              {value: undefined, label: 'All'},
                                              {value: 'Active', label: 'Active'},
                                              {value: 'Inactive', label: 'Inactive'},

                                          ]}
                                          optionValue={o => o.value}
                                          optionTitle={i => i.label}
                                          onChange={(val) => onChange({...value, inactive: val === 'Inactive'})}
                            />
                        </FormField>
                    }
                </div>

            </div>


        </>
    )
}



