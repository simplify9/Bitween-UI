import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {RetryPolicyRow} from "src/types/retryPolicies";
import {BsFillEyeFill} from "react-icons/bs";
import {MdDelete} from "react-icons/md";
import Button from "src/components/common/forms/Button";
import {useDeleteRetryPolicyMutation} from "src/client/apis/retryPoliciesApi";
import Dialog from "src/components/common/dialog";
import Authorize from "src/components/common/authorize/authorize";

interface Props {
    data: RetryPolicyRow[];
}

export const RetryPoliciesList: React.FC<Props> = ({data}) => {

    let navigate = useNavigate();
    const [deletePolicy] = useDeleteRetryPolicyMutation();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const onConfirmDelete = async () => {
        if (pendingDeleteId) {
            await deletePolicy(pendingDeleteId);
            setPendingDeleteId(null);
        }
    }

    return (
        <>
            {pendingDeleteId && (
                <Dialog
                    onCancel={() => setPendingDeleteId(null)}
                    onConfirm={onConfirmDelete}
                    title={`Are you sure you want to delete "${data.find(i => i.id === pendingDeleteId)?.name}"? This action cannot be undone.`}
                />
            )}
            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        ID
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Name
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Groups
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    data?.map(i => (
                        <tr key={i.id} className="bg-white border-b transition duration-300 ease-in-out ">
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.id}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.name}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.groupCount}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap flex items-center gap-2">
                                <Button variant={"none"} onClick={() => navigate(`${i.id}`)}>
                                    <BsFillEyeFill className={"text-primary-600"} size={21}/>
                                </Button>
                                <Authorize roles={["Admin", "Member"]}>
                                    <Button variant={"none"} onClick={() => setPendingDeleteId(i.id)}>
                                        <MdDelete className={"text-red-500"} size={21}/>
                                    </Button>
                                </Authorize>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </>
    )
}
