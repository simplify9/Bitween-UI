import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {BusGatewayModel} from "src/types/busGateways";
import {BsFillEyeFill} from "react-icons/bs";
import {MdDelete} from "react-icons/md";
import Button from "src/components/common/forms/Button";
import {useDeleteBusGatewayMutation} from "src/client/apis/busGatewaysApi";
import Dialog from "src/components/common/dialog";
import Authorize from "src/components/common/authorize/authorize";

interface Props {
    data: BusGatewayModel[];
}

export const BusGatewaysList: React.FC<Props> = ({data}) => {
    const navigate = useNavigate();
    const [deleteGateway] = useDeleteBusGatewayMutation();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const onConfirmDelete = async () => {
        if (pendingDeleteId !== null) {
            await deleteGateway(pendingDeleteId);
            setPendingDeleteId(null);
        }
    }

    return (
        <>
            {pendingDeleteId !== null && (
                <Dialog
                    onCancel={() => setPendingDeleteId(null)}
                    onConfirm={onConfirmDelete}
                    title={`Are you sure you want to delete "${data.find(i => i.id === pendingDeleteId)?.name}"? This action cannot be undone.`}
                />
            )}
            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">ID</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Name</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Document</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Routes</th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {data?.length === 0 && (
                    <tr>
                        <td colSpan={5} className="text-sm text-gray-400 px-6 py-8 text-center">
                            No bus gateways yet. Click <span className="font-medium text-gray-500">Add</span> to create one.
                        </td>
                    </tr>
                )}
                {data?.map(i => (
                    <tr key={i.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="text-sm text-gray-400 font-light px-6 py-2 whitespace-nowrap">{i.id}</td>
                        <td className="text-sm text-gray-900 font-medium px-6 py-2 whitespace-nowrap">{i.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                {i.documentName}
                            </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center min-w-[1.5rem] text-xs font-semibold px-2 py-0.5 rounded-full ${(i.routesCount ?? 0) > 0 ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'}`}>
                                {i.routesCount ?? 0}
                            </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Button variant="none" onClick={() => navigate(`${i.id}`)}>
                                    <BsFillEyeFill className="text-primary-600" size={21}/>
                                </Button>
                                <Authorize roles={["Admin", "Member"]}>
                                    <Button variant="none" onClick={() => setPendingDeleteId(i.id)}>
                                        <MdDelete className="text-red-500" size={21}/>
                                    </Button>
                                </Authorize>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}
