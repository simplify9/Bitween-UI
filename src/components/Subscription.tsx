import {useNavigate, useParams} from "react-router-dom";
import Button from "./common/forms/Button";
import Input from "./common/forms/Input";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import {useEffect, useState} from "react";
import {apiClient} from "../client";
import {KeyValuePair} from "../types/common";
import KeyValueEditor from "./common/forms/KeyValueEditor";
import {ISubscription, IUpdateSubscription} from "../types/subscriptions";


const Component = () => {
    let navigate = useNavigate();
    let {id} = useParams();
    const [subscription, setSubscription] = useState<ISubscription>();
    const [updateSubscriptionData, setUpdateSubscriptionData] = useState<IUpdateSubscription>({});

    useEffect(() => {
        if (id) {
            refreshSubscription(id);
        }

    }, [id]);
    useEffect(() => {
        setUpdateSubscriptionData({
            name: subscription?.name,
        })
    }, [subscription])

    const refreshSubscription = async (id: string) => {
        let res = await apiClient.findSubscription(id);
        if (res.succeeded) setSubscription(res.data);
    }

    const updateSubscription = async () => {
        let res = await apiClient.updateSubscription(id!,updateSubscriptionData);
        if (res.succeeded) await refreshSubscription(id!);
    }
    const deleteSubscription = async () => {
        let res = await apiClient.deleteSubscription(id!);
        if (res.succeeded) navigate('/subscriptions')
    }



    return (
        <div className="flex flex-col w-full px-8 py-10">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Subscriptions</div>
                <div className={"flex gap-2"}>

                    <Button onClick={deleteSubscription} className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded">
                        Delete
                    </Button>

                </div>
            </div>
            <div className="relative z-0 w-full mb-6 group">
                <FormField title="ID" className="grow">
                    <TextEditor disabled={true} value={id}/>
                </FormField>
            </div>
            <div className="relative z-0 w-full mb-6 group">
                <FormField title="Name" className="grow">
                    <TextEditor value={updateSubscriptionData?.name} onChange={(t) => setUpdateSubscriptionData({
                        ...updateSubscriptionData,
                        name: t
                    })}/>
                </FormField>
            </div>


            <div className={"flex w-full gap-2"}>
                <Button
                    onClick={() => navigate('/partners')}
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
