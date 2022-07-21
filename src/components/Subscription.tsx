import {useNavigate, useParams} from "react-router-dom";
import Button from "./common/forms/Button";
import Input from "./common/forms/Input";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import {useCallback, useEffect, useState} from "react";
import {apiClient} from "../client";
import {OptionType} from "../types/common";
import {
  ISubscription,
  ScheduleView,
  SubscriptionTypeOptions
} from "../types/subscriptions";
import {ChoiceEditor} from "./common/forms/ChoiceEditor";
import DocumentSelector from "./Documents/DocumentSelector";
import PartnerSelector from "./Partners/PartnerSelector";
import AdapterEditor from "./Subscriptions/AdapterEditor";
import SubscriptionSelector from "./Subscriptions/SubscriptionSelector";
import ScheduleEditor from "./Subscriptions/ScheduleEditor";
import SubscriptionFilter
  from "src/components/Subscriptions/SubscriptionFilter";


const Component = () => {
  let navigate = useNavigate();
  let { id } = useParams();
  const [subscription, setSubscription] = useState<ISubscription>();

  const [updateSubscriptionData, setUpdateSubscriptionData] = useState<ISubscription>({});

  useEffect(() => {
    if (id) {
      refreshSubscription(id).then();
    }
  }, [id]);
  useEffect(() => {
    setUpdateSubscriptionData(subscription!)
  }, [subscription])

  const refreshSubscription = async (id: string) => {
    let res = await apiClient.findSubscription(id);
    if (res.succeeded) setSubscription({
      ...res.data,
      schedules: res.data.schedules.map((s: ScheduleView, index: number) => ({
        ...s,
        id: index
      }))
    });
  }

  const updateSubscription = async () => {
    let res = await apiClient.updateSubscription(id!, updateSubscriptionData!);
    if (res.succeeded) await refreshSubscription(id!);
  }
  const deleteSubscription = async () => {
    let res = await apiClient.deleteSubscription(id!);
    if (res.succeeded) navigate('/subscriptions')
  }
  const onChangeSubscriptionData = useCallback((key: any, value: any) => {
    setSubscription((s) => ({
      ...s,
      [key]: value
    }))
  }, [setSubscription])
  // const onAddSchedule = useCallback((newS: ScheduleView) => {
  //   setSubscription((s) => ({
  //     ...s,
  //     schedules: [...(s?.schedules ?? []), newS]
  //   }))
  // }, [setSubscription])

  if (subscription == null) return <></>
  return (
    <div className="flex flex-col w-full px-8 py-10">
      <div className="justify-between w-full flex py-4">
        <div
          className="text-2xl font-bold tracking-wide text-gray-700">Subscriptions
        </div>
        <div className={"flex gap-2"}>
          <Button onClick={deleteSubscription}
                  className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded">
            Delete
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-6 rounded mb-6 border-2 px-2 py-2">
        <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
          <FormField title="ID" className="grow">
            <TextEditor disabled={true} value={id}/>
          </FormField>
        </div>
        <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
          <FormField title="Type" className="grow">
            <ChoiceEditor
              disabled={true}
              value={updateSubscriptionData?.type?.toString()}
              onChange={onChangeSubscriptionData.bind(null, "type")}
              optionTitle={(item: OptionType) => item.title}
              optionValue={(item: OptionType) => item.id}
              options={SubscriptionTypeOptions}/>
          </FormField>
        </div>

        <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
          <FormField title="Document" className="grow">
            <DocumentSelector disabled={true}
                              value={updateSubscriptionData?.documentId}
                              onChange={onChangeSubscriptionData.bind(null, "documentId")}

            />
          </FormField>
        </div>

        <div className="col-span-6 sm:col-span-3 lg:col-span-1 ">
          <FormField title="Partner" className="grow">
            <PartnerSelector disabled={true}
                             value={updateSubscriptionData?.partnerId}
                             onChange={onChangeSubscriptionData.bind(null, "partnerId")}

            />
          </FormField>
        </div>

        <div className="col-span-6 sm:col-span-3 lg:col-span-2 ">
          <FormField title="Name" className="grow">
            <TextEditor value={updateSubscriptionData?.name}
                        onChange={onChangeSubscriptionData.bind(null, "name")}
            />
          </FormField>
        </div>


      </div>


      <div className="grid grid-cols-6 gap-6 rounded mb-6">
        {updateSubscriptionData?.type == "1" &&
          <div
            className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">
            <FormField title="Filters" className="grow">
              <SubscriptionFilter
                documentId={subscription.documentId}
                onChange={onChangeSubscriptionData.bind(null, "documentFilter")}
                promotedProperties={updateSubscriptionData.receiverProperties}
                documentFilter={updateSubscriptionData?.documentFilter}/>
            </FormField>
          </div>}
        {updateSubscriptionData?.type == "8" &&
          <div
            className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">

            <FormField title="Aggregation" className="grow">
            </FormField>
            <FormField title="Subscription">
              <SubscriptionSelector
                value={updateSubscriptionData.aggregationForId}
                onChange={() => {
                }}
                disabled={true}
              />
            </FormField>
            <FormField title="Target">
              <ChoiceEditor
                value={updateSubscriptionData?.aggregationTarget?.toString()}
                onChange={val => setUpdateSubscriptionData({
                  ...updateSubscriptionData,
                  aggregationTarget: val
                })}
                optionTitle={(item: OptionType) => item.title}
                optionValue={(item: OptionType) => item.id}
                options={[{ id: '0', title: 'Input' },
                  { id: '1', title: 'Output' },
                  { id: '2', title: 'Response' }]}/>
            </FormField>

            <div className={"mt-5"}>

              <ScheduleEditor title={"Schedule"}
                              onChangeSchedules={onChangeSubscriptionData.bind(null, "schedules")}
                              schedule={updateSubscriptionData.schedules}/>
            </div>


          </div>}
        {updateSubscriptionData?.type == "2" &&
          <div
            className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">

            <AdapterEditor title={"Validator"} type={"validators"}
                           value={updateSubscriptionData?.validatorId}
                           onChange={(t) => setUpdateSubscriptionData({
                             ...updateSubscriptionData,
                             validatorId: t
                           })}
                           props={updateSubscriptionData?.validatorProperties}
            />


          </div>}
        {updateSubscriptionData?.type == "4" &&
          <div
            className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">

            <AdapterEditor title={"Receiver"} type={"receivers"}
                           value={updateSubscriptionData?.receiverId}
                           onChange={(t) => setUpdateSubscriptionData({
                             ...updateSubscriptionData,
                             receiverId: t
                           })}
                           props={updateSubscriptionData?.receiverProperties}
            />
            <ScheduleEditor title={"Schedule"}
                            onChangeSchedules={onChangeSubscriptionData.bind(this, "schedules")}
                            schedule={updateSubscriptionData.schedules}/>

          </div>}

        <div
          className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">

          <AdapterEditor title={"Mapper"} type={"mappers"}
                         value={updateSubscriptionData?.mapperId}
                         onChange={(t) => setUpdateSubscriptionData({
                           ...updateSubscriptionData,
                           mapperId: t
                         })}
                         onPropsChange={onChangeSubscriptionData.bind(this, "mapperProperties")}
                         props={updateSubscriptionData?.mapperProperties}
          />


        </div>

        <div
          className="col-span-6 sm:col-span-3 lg:col-span-2 border-2 px-2 py-2">

          <AdapterEditor title={"Handler"} type={"handlers"}
                         value={updateSubscriptionData?.handlerId}
                         onChange={(t) => setUpdateSubscriptionData({
                           ...updateSubscriptionData,
                           handlerId: t
                         })}
                         props={updateSubscriptionData?.handlerProperties}
          />


        </div>

      </div>


      <div className={"flex w-full gap-2"}>
        <Button
          onClick={() => navigate('/subscriptions')}
          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">Cancel
        </Button>
        <Button
          onClick={updateSubscription}
          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">Save
        </Button>
      </div>


    </div>
  );
}

export default Component;
