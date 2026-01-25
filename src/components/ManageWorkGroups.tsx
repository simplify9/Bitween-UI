import {useWorkGroupsQuery} from "src/client/apis/subscriptionsApi";
import {useState} from "react";
import {SearchWorkGroupModel} from "src/types/subscriptions";
import WorkGroupsList from "src/components/Subscriptions/WorkGroups/WorkGroupsList";
import {DataListViewSettingsEditor} from "src/components/common/DataListViewSettingsEditor";
import Button from "src/components/common/forms/Button";
import CreateWorkGroupModal from "src/components/Subscriptions/WorkGroups/CreateWorkGroupModal";

const ManageWorkGroups = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [findSpecs, setFindSpecs] = useState<SearchWorkGroupModel>({
        limit: 10,
        offset: 0
    });


    const workGroups = useWorkGroupsQuery(findSpecs)

    const handleModalClose = () => {
        setIsAddModalOpen(false);
        // Refetch is automatic due to cache invalidation, but we can trigger it explicitly if needed
        workGroups.refetch();
    };
    
    return <div className={"p-10 max-w-[800px]"}>
        {
            isAddModalOpen && <CreateWorkGroupModal onClose={handleModalClose}/>
        }
        <div className={"flex flex-row justify-end"}>
            <div className={""}>
                <Button onClick={() => setIsAddModalOpen(true)}>Add</Button>

            </div>
        </div>
        <div className={""}>
            <WorkGroupsList data={workGroups.data?.result ?? []} onRefresh={() => workGroups.refetch()}/>
            {
                Boolean(workGroups.data) && <DataListViewSettingsEditor
                    total={workGroups.data?.totalCount}
                    offset={findSpecs.offset}
                    limit={findSpecs.limit}
                    onChange={(values) =>
                        setFindSpecs(
                            (e) =>
                                ({...e, offset: values.offset, limit: values.limit}))}
                />
            }

        </div>
    </div>
}
export default ManageWorkGroups
