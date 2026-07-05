import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    useLazyBusGatewayQuery,
    useUpdateBusGatewayMutation,
    useAddRouteToGatewayMutation,
    useRemoveRouteFromGatewayMutation,
    useUpdateGatewayRouteMutation,
} from "src/client/apis/busGatewaysApi";
import {BusGatewayModel, BusGatewayRouteDto} from "src/types/busGateways";
import Button from "src/components/common/forms/Button";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import Authorize from "src/components/common/authorize/authorize";
import {MdDelete, MdEdit} from "react-icons/md";
import Dialog from "src/components/common/dialog";
import Modal from "src/components/common/Modal";
import {useSubscriptionsQuery} from "src/client/apis/subscriptionsApi";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {MatchExpression, SubscriptionType} from "src/types/subscriptions";
import MatchExpressionEditor from "src/components/Subscriptions/MatchExpressionEditor/MatchExpressionEditor";
import {getDescription} from "src/components/Subscriptions/MatchExpressionEditor/util";
import {apiClient} from "src/client";
import {IPartner} from "src/types/partners";

const BusGateway: React.FC = () => {
    const nav = useNavigate();
    const {id} = useParams() as {id: string};
    const gatewayId = Number(id);

    const [fetch] = useLazyBusGatewayQuery();
    const [update] = useUpdateBusGatewayMutation();
    const [addRoute] = useAddRouteToGatewayMutation();
    const [removeRoute] = useRemoveRouteFromGatewayMutation();
    const [updateRoute] = useUpdateGatewayRouteMutation();

    const [data, setData] = useState<BusGatewayModel>();
    const [showDeleteRoute, setShowDeleteRoute] = useState<number | null>(null);
    const [showAddRoute, setShowAddRoute] = useState(false);
    const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

    const [formSubscriptionId, setFormSubscriptionId] = useState<number | null>(null);
    const [formPartnerId, setFormPartnerId] = useState<number | null>(null);
    const [formMatchExpression, setFormMatchExpression] = useState<MatchExpression | null>(null);

    const [partners, setPartners] = useState<IPartner[]>([]);
    const subscriptions = useSubscriptionsQuery({
        offset: 0,
        limit: 500,
        type: SubscriptionType.BusGateway,
        documentId: data?.documentId ?? null,
    });

    const busGatewaySubs = subscriptions.data?.result ?? [];

    useEffect(() => {
        fetchData();
        apiClient.findPartners({nameContains: "", limit: 500, offset: 0, orderBy: undefined})
            .then(r => { setPartners(r.data ?? []); });
    }, [id]);

    const fetchData = async () => {
        const result = await fetch(gatewayId);
        if (result.isSuccess && result.data) setData(result.data as BusGatewayModel);
    }

    const resetForm = () => {
        setFormSubscriptionId(null);
        setFormPartnerId(null);
        setFormMatchExpression(null);
    }

    const onUpdate = async () => {
        if (!data) return;
        await update({id: gatewayId, name: data.name});
    }

    const onRemoveRoute = async () => {
        if (showDeleteRoute === null) return;
        await removeRoute({gatewayId, routeId: showDeleteRoute});
        setShowDeleteRoute(null);
        fetchData();
    }

    const onAddRoute = async () => {
        if (formSubscriptionId === null) return;
        await addRoute({
            gatewayId,
            subscriptionId: formSubscriptionId,
            partnerId: formPartnerId,
            matchExpression: formMatchExpression,
        });
        setShowAddRoute(false);
        resetForm();
        fetchData();
    }

    const onUpdateRoute = async () => {
        if (editingRouteId === null || formSubscriptionId === null) return;
        await updateRoute({
            gatewayId,
            routeId: editingRouteId,
            subscriptionId: formSubscriptionId,
            partnerId: formPartnerId,
            matchExpression: formMatchExpression,
        });
        setEditingRouteId(null);
        resetForm();
        fetchData();
    }

    const openAddRoute = () => {
        resetForm();
        setShowAddRoute(true);
    }

    const openEditRoute = (route: BusGatewayRouteDto) => {
        setFormSubscriptionId(route.subscriptionId);
        setFormPartnerId(route.partnerId ?? null);
        setFormMatchExpression(route.matchExpression ?? null);
        setEditingRouteId(route.id);
    }

    const closeRouteModal = () => {
        setShowAddRoute(false);
        setEditingRouteId(null);
        resetForm();
    }

    if (!data) return <></>;

    const routeFields = (
        <div className="flex flex-col gap-4">
            <FormField title="Subscription (BusGateway)" className="grow">
                <p className="text-xs normal-case font-normal text-gray-400 mb-1">
                    Runs when the filter below matches. Only published BusGateway subscriptions on this document are listed.
                </p>
                <ChoiceEditor
                    placeholder="Select Subscription"
                    value={formSubscriptionId?.toString() ?? ""}
                    onChange={v => setFormSubscriptionId(v ? Number(v) : null)}
                    options={busGatewaySubs}
                    optionValue={s => s.id!.toString()}
                    optionTitle={s => s.name ?? ""}
                />
            </FormField>
            <FormField title="Partner (optional)" className="grow">
                <p className="text-xs normal-case font-normal text-gray-400 mb-1">
                    Optionally inject a partner's values into the subscription.
                </p>
                <ChoiceEditor
                    placeholder="Select Partner"
                    isClearable
                    value={formPartnerId?.toString() ?? ""}
                    onChange={v => setFormPartnerId(v ? Number(v) : null)}
                    options={partners}
                    optionValue={p => p.id}
                    optionTitle={p => p.name}
                />
            </FormField>
            <FormField title="Filter" className="grow">
                <p className="text-xs normal-case font-normal text-gray-400 mb-1">
                    Runs the subscription only for messages that match. Leave empty to match every message.
                </p>
                <MatchExpressionEditor
                    expression={formMatchExpression as MatchExpression}
                    documentId={String(data.documentId)}
                    onChange={e => setFormMatchExpression(e)}
                />
            </FormField>
        </div>
    );

    return (
        <div className="flex flex-col mt-3 gap-6 md:max-w-[900px]">
            {showDeleteRoute !== null && (
                <Dialog
                    title="Remove this route from the gateway?"
                    onConfirm={onRemoveRoute}
                    onCancel={() => setShowDeleteRoute(null)}
                />
            )}

            {/* Add Route Modal */}
            {showAddRoute && (
                <Modal onClose={closeRouteModal} submitLabel="Add" onSubmit={onAddRoute}>
                    <h3 className="text-lg font-medium mb-4">Add Route</h3>
                    {routeFields}
                </Modal>
            )}

            {/* Edit Route Modal */}
            {editingRouteId !== null && (
                <Modal onClose={closeRouteModal} submitLabel="Update" onSubmit={onUpdateRoute}>
                    <h3 className="text-lg font-medium mb-4">Update Route</h3>
                    {routeFields}
                </Modal>
            )}

            {/* Basic info */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col gap-4">
                <FormField title="Name" className="grow">
                    <TextEditor value={data.name} onChange={v => setData({...data, name: v})}/>
                </FormField>
                <FormField title="Document" className="grow">
                    <TextEditor value={data.documentName ?? String(data.documentId)} onChange={() => {}} disabled/>
                </FormField>
                <div className="text-xs text-gray-400">
                    Incoming bus messages for this document are matched against the routes below; each matching route runs its subscription (with the optional partner's values).
                </div>
            </div>

            {/* Routes table */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-700">Routes</h3>
                    <Authorize roles={["Admin", "Member"]}>
                        <div>
                            <Button onClick={openAddRoute}>Add Route</Button>
                        </div>
                    </Authorize>
                </div>
                <table className="appearance-none min-w-full">
                    <thead className="border-y bg-gray-50">
                    <tr>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Filter</th>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Subscription</th>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Partner</th>
                        <th className="text-sm font-medium text-gray-900 px-4 py-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.routes?.length === 0 && (
                        <tr><td colSpan={4} className="text-sm text-gray-400 px-4 py-3">No routes configured.</td></tr>
                    )}
                    {data.routes?.map(r => (
                        <tr key={r.id} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-4 py-2">
                                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {getDescription(r.matchExpression as MatchExpression) || "All messages"}
                                </code>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-4 py-2">{r.subscriptionName}</td>
                            <td className="text-sm text-gray-900 font-light px-4 py-2">{r.partnerName ?? "—"}</td>
                            <td className="text-sm text-gray-900 font-light px-4 py-2 flex gap-2">
                                <Authorize roles={["Admin", "Member"]}>
                                    <>
                                        <Button variant="none" onClick={() => openEditRoute(r)}>
                                            <MdEdit className="text-primary-600" size={19}/>
                                        </Button>
                                        <Button variant="none" onClick={() => setShowDeleteRoute(r.id)}>
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
                <Button variant="secondary" onClick={() => nav('/bus-gateways')}>Cancel</Button>
            </div>
        </div>
    );
}

export default BusGateway;
