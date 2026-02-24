import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    useLazyApiGatewayQuery,
    useUpdateApiGatewayMutation,
    useAddPartnerToGatewayMutation,
    useRemovePartnerFromGatewayMutation,
    useUpdateGatewayPartnerMutation,
} from "src/client/apis/apiGatewaysApi";
import {ApiGatewayModel, ApiGatewayPartnerCreate} from "src/types/apiGateways";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import {MdDelete, MdEdit} from "react-icons/md";
import Dialog from "src/components/common/dialog";
import Modal from "src/components/common/Modal";
import {useSubscriptionsQuery} from "src/client/apis/subscriptionsApi";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {useApiGatewaysQuery} from "src/client/apis/apiGatewaysApi";
import {SubscriptionType} from "src/types/subscriptions";

// reuse partners lookup via existing apiClient
import {apiClient} from "src/client";
import {IPartner} from "src/types/partners";

const ApiGateway: React.FC = () => {
    const nav = useNavigate();
    const {id} = useParams() as {id: string};
    const gatewayId = Number(id);

    const [fetch] = useLazyApiGatewayQuery();
    const [update] = useUpdateApiGatewayMutation();
    const [addPartner] = useAddPartnerToGatewayMutation();
    const [removePartner] = useRemovePartnerFromGatewayMutation();
    const [updatePartner] = useUpdateGatewayPartnerMutation();

    const [data, setData] = useState<ApiGatewayModel>();
    const [showDeletePartner, setShowDeletePartner] = useState<number | null>(null);
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [editingPartner, setEditingPartner] = useState<{ partnerId: number; subscriptionId: number } | null>(null);

    const [newPartnerId, setNewPartnerId] = useState<number | null>(null);
    const [newSubscriptionId, setNewSubscriptionId] = useState<number | null>(null);

    const [partners, setPartners] = useState<IPartner[]>([]);
    const subscriptions = useSubscriptionsQuery({offset: 0, limit: 500, type: SubscriptionType.GatewayApiCall});

    const gatewayApiCallSubs = subscriptions.data?.result ?? [];

    useEffect(() => {
        fetchData();
        apiClient.findPartners({nameContains: "", limit: 500, offset: 0, orderBy: undefined})
            .then(r => { setPartners(r.data ?? []); });
    }, [id]);

    const fetchData = async () => {
        const result = await fetch(gatewayId);
        if (result.isSuccess && result.data) setData(result.data as ApiGatewayModel);
    }

    const onUpdate = async () => {
        if (!data) return;
        await update({id: gatewayId, name: data.name, urlName: data.urlName});
    }

    const onRemovePartner = async () => {
        if (showDeletePartner === null) return;
        await removePartner({gatewayId, partnerId: showDeletePartner});
        setShowDeletePartner(null);
        fetchData();
    }

    const onAddPartner = async () => {
        if (newPartnerId === null || newSubscriptionId === null) return;
        await addPartner({gatewayId, partnerId: newPartnerId, subscriptionId: newSubscriptionId});
        setShowAddPartner(false);
        setNewPartnerId(null);
        setNewSubscriptionId(null);
        fetchData();
    }

    const onUpdatePartner = async () => {
        if (!editingPartner || newSubscriptionId === null) return;
        await updatePartner({gatewayId, partnerId: editingPartner.partnerId, subscriptionId: newSubscriptionId});
        setEditingPartner(null);
        setNewSubscriptionId(null);
        fetchData();
    }

    const openEditPartner = (partnerId: number, subscriptionId: number) => {
        setEditingPartner({partnerId, subscriptionId});
        setNewSubscriptionId(subscriptionId);
    }

    if (!data) return <></>;

    return (
        <div className="flex flex-col mt-3 gap-6 md:max-w-[750px]">
            {showDeletePartner !== null && (
                <Dialog
                    title={`Remove partner "${data.partners?.find(p => p.partnerId === showDeletePartner)?.partnerName}" from this gateway?`}
                    onConfirm={onRemovePartner}
                    onCancel={() => setShowDeletePartner(null)}
                />
            )}

            {/* Add Partner Modal */}
            {showAddPartner && (
                <Modal onClose={() => setShowAddPartner(false)} submitLabel="Add" onSubmit={onAddPartner}>
                    <h3 className="text-lg font-medium mb-4">Add Partner to Gateway</h3>
                    <FormField title="Partner" className="grow">
                        <ChoiceEditor
                            placeholder="Select Partner"
                            value={newPartnerId?.toString() ?? ""}
                            onChange={v => setNewPartnerId(Number(v))}
                            options={partners}
                            optionValue={p => p.id}
                            optionTitle={p => p.name}
                        />
                    </FormField>
                    <FormField title="Subscription (GatewayApiCall)" className="grow">
                        <ChoiceEditor
                            placeholder="Select Subscription"
                            value={newSubscriptionId?.toString() ?? ""}
                            onChange={v => setNewSubscriptionId(Number(v))}
                            options={gatewayApiCallSubs}
                            optionValue={s => s.id.toString()}
                            optionTitle={s => s.name}
                        />
                    </FormField>
                </Modal>
            )}

            {/* Edit Partner Modal */}
            {editingPartner && (
                <Modal onClose={() => { setEditingPartner(null); setNewSubscriptionId(null); }} submitLabel="Update" onSubmit={onUpdatePartner}>
                    <h3 className="text-lg font-medium mb-4">Update Partner Subscription</h3>
                    <FormField title="Subscription (GatewayApiCall)" className="grow">
                        <ChoiceEditor
                            placeholder="Select Subscription"
                            value={newSubscriptionId?.toString() ?? ""}
                            onChange={v => setNewSubscriptionId(Number(v))}
                            options={gatewayApiCallSubs}
                            optionValue={s => s.id.toString()}
                            optionTitle={s => s.name}
                        />
                    </FormField>
                </Modal>
            )}

            {/* Basic info */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col gap-4">
                <FormField title="Name" className="grow">
                    <TextEditor value={data.name} onChange={v => setData({...data, name: v})}/>
                </FormField>
                <FormField title="URL Name" className="grow">
                    <TextEditor value={data.urlName} onChange={v => setData({...data, urlName: v})}/>
                </FormField>
                <div className="text-xs text-gray-400">
                    Gateway URL: <code className="bg-gray-100 px-1 rounded">/api/Gateway/{data.urlName}/sync</code>
                    {" | "}<code className="bg-gray-100 px-1 rounded">/api/Gateway/{data.urlName}/async</code>
                </div>
            </div>

            {/* Partners table */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-700">Partners</h3>
                    <Authorize roles={["Admin", "Member"]}>
                        <div>
                            <Button onClick={() => setShowAddPartner(true)}>Add Partner</Button>
                        </div>
                    </Authorize>
                </div>
                <table className="appearance-none min-w-full">
                    <thead className="border-y bg-gray-50">
                    <tr>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Partner</th>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Subscription</th>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.partners?.length === 0 && (
                        <tr><td colSpan={3} className="text-sm text-gray-400 px-4 py-3">No partners assigned.</td></tr>
                    )}
                    {data.partners?.map(p => (
                        <tr key={`${p.partnerId}-${p.subscriptionId}`} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-4 py-2">{p.partnerName}</td>
                            <td className="text-sm text-gray-900 font-light px-4 py-2">{p.subscriptionName}</td>
                            <td className="text-sm text-gray-900 font-light px-4 py-2 flex gap-2">
                                <Authorize roles={["Admin", "Member"]}>
                                    <>
                                        <Button variant="none" onClick={() => openEditPartner(p.partnerId, p.subscriptionId)}>
                                            <MdEdit className="text-primary-600" size={19}/>
                                        </Button>
                                        <Button variant="none" onClick={() => setShowDeletePartner(p.partnerId)}>
                                            <MdDelete className="text-red-500" size={19}/>
                                        </Button>
                                    </>
                                </Authorize>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Footer actions */}
            <div className="flex flex-row-reverse gap-2">
                <Authorize roles={["Admin", "Member"]}>
                    <Button onClick={onUpdate}>Save</Button>
                </Authorize>
                <Button variant="secondary" onClick={() => nav('/api-gateways')}>Cancel</Button>
            </div>
        </div>
    );
}

export default ApiGateway;
