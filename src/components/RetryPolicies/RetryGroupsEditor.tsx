import FormField from "src/components/common/forms/FormField";
import {RetryGroup} from "src/types/retryPolicies";
import React, {useState} from "react";
import Button from "src/components/common/forms/Button";
import AddEditRetryGroupModal from "src/components/RetryPolicies/AddEditRetryGroupModal";
import {summarizeMatcher} from "src/components/RetryPolicies/MatchersEditor";
import {MdModeEditOutline, MdOutlineRemoveCircle} from "react-icons/md";
import {HiPlusCircle} from "react-icons/hi";

interface Props {
    groups?: RetryGroup[]
    title: string
    onChange: (val: RetryGroup[]) => void
}

const RetryGroupsEditor: React.FC<Props> = ({title, groups, onChange}) => {

    const [visibleModal, setVisibleModal] = useState<"NONE" | "ADD_EDIT">("NONE")
    const [editingGroup, setEditingGroup] = useState<RetryGroup | undefined>(undefined)

    const onClickAdd = () => {
        setEditingGroup(undefined)
        setVisibleModal("ADD_EDIT")
    }

    const onClickEdit = (id?: string) => {
        setEditingGroup(groups?.find(g => g.id === id))
        setVisibleModal("ADD_EDIT")
    }

    const onRemove = (id?: string) => {
        onChange((groups ?? []).filter(g => g.id !== id))
    }

    const onAdd = (group: RetryGroup) => {
        const existing = (groups ?? []).some(g => g.id === group.id)
        if (existing) {
            onChange((groups ?? []).map(g => g.id === group.id ? group : g))
        } else {
            onChange([...(groups ?? []), group])
        }
    }

    return (
        <div className={"mt-3"}>
            {visibleModal === "ADD_EDIT" &&
                <AddEditRetryGroupModal
                    visible={visibleModal === "ADD_EDIT"}
                    initial={editingGroup}
                    onAdd={onAdd}
                    onClose={() => setVisibleModal("NONE")}/>
            }
            <FormField title={title} className="grow" actionTitle={
                <div className={"text-green-600 rounded"}>
                    <HiPlusCircle size={25}/>
                </div>
            } onClickAction={onClickAdd}>
                <p className={"text-xs text-gray-500 mb-2"}>
                    Groups are evaluated in priority order (lowest first). The first enabled group whose matchers
                    match the failure wins, and its action and retry budget are applied — remaining groups are
                    skipped. If no group matches, the failure is not retried.
                </p>
                <div className={"flex flex-col gap-2"}>
                    <table className="appearance-none min-w-full">
                        <thead className="border-y bg-gray-50">
                        <tr>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Priority</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Name</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Applies to</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Matchers</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Action</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">Enabled</th>
                            <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            groups?.map((g) => (
                                <tr key={g.id} className="bg-white border-b">
                                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                        {g.priority}
                                    </td>
                                    <td className="text-sm text-gray-900 font-semibold px-6 py-4 whitespace-nowrap">
                                        {g.name}
                                    </td>
                                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                        {g.appliesTo?.join(", ")}
                                    </td>
                                    <td className="text-sm text-gray-900 font-light px-6 py-4">
                                        {g.matchers?.length ? (
                                            <div className={"flex flex-col gap-1"}>
                                                {g.matchers.map((m, i) => (
                                                    <span key={i}
                                                          className={"inline-block w-fit bg-gray-100 border rounded px-2 py-0.5 text-xs"}>
                                                        {summarizeMatcher(m)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className={"text-gray-400 italic"}>Any failure</span>}
                                    </td>
                                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                        {g.action}
                                    </td>
                                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                        {g.enabled === false ? "False" : "True"}
                                    </td>
                                    <td>
                                        <div className={"flex flex-row"}>
                                            <Button onClick={() => onClickEdit(g.id)} variant={"none"}>
                                                <MdModeEditOutline className={"text-yellow-300"} size={21}/>
                                            </Button>
                                            <Button variant={"none"} onClick={() => onRemove(g.id)}>
                                                <MdOutlineRemoveCircle className={"text-red-600"} size={21}/>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </FormField>
        </div>
    );
}

export default RetryGroupsEditor;
