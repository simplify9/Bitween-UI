import React, {useState} from "react";
import {useMembersFinder} from "src/hooks/queryHooks";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import AddMemberModal from "src/components/Settings/AddMemberModal";
import {AccountModel, EditModal} from "src/types/accounts";
import {MdOutlineRemoveCircle,MdModeEditOutline} from "react-icons/md";
import Authorize from "src/components/common/authorize/authorize";
import Button from "src/components/common/forms/Button";
import EditMemberModal from "src/components/Settings/EditMemberModal";
import {useFindMembersQuery, useRemoveMemberMutation} from "src/client/apis/generalApi";


const defaultQuery = {
    offset: 0,
    limit: 100,
}

const MembersInfo: React.FC = () => {
const {data}=useFindMembersQuery(defaultQuery)
 const [removeMember]=useRemoveMemberMutation()
    const [openModal, setOpenModal] = useState<"NONE" | "ADD" | "EDIT">("NONE");
    const [memberToEdit, setMemberToEdit] = useState<EditModal | null>(null);

const getRole=(role)=>{
    switch (role){
        case 'Admin':
            return 0
        case 'Viewer':
            return 10
        case 'Member':
            return 20
    }
}
    const onRemoveMember = async (id: number) => {
        await removeMember({id:id})
    }

    return <div className={"bg-white p-3 shadow-lg rounded-lg "}>
        {
            openModal === "ADD" && <AddMemberModal onClose={() => {
                setOpenModal("NONE")
            }}/>
        }
        {
            openModal==="EDIT" && <EditMemberModal member={memberToEdit} onClose={()=>{
                setOpenModal("NONE")

            }}/> }
        <div className={"flex justify-between"}>
            <span className={"text-lg"}>
                        Members Info
            </span>
            <div>
                <Authorize roles={["Admin"]}>
                    <Button onClick={() => setOpenModal("ADD")}
                    >
                        Add
                    </Button>

                </Authorize>
            </div>



        </div>
        <div className="pt-3 w">
            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Role
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Name
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Email
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Created On
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">

                    </th>
                </tr>
                </thead>
                <tbody>
                {
                   data && data?.result?.filter((i: AccountModel) => i.id != 9999)?.map((i: AccountModel) => (
                        <tr key={i.email} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {i.role}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {i.name}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {i.email}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {toLocalDateTimeString(i.createdOn)}
                            </td>
                            <td className="text-sm  font-light px-6 py-4 whitespace-nowrap">
                                <Authorize roles={["Admin"]}>
                                    <div className={'flex flex-row-reverse items-center gap-x-2'}>
                                        <MdOutlineRemoveCircle onClick={() => onRemoveMember(i.id)} size={21}
                                                               className={"text-yellow-400 cursor-pointer"}/>
                                         <MdModeEditOutline className={"cursor-pointer"} onClick={()=>{
                                             setMemberToEdit({id:i.id,name:i.name,role:getRole(i.role)})
                                             setOpenModal("EDIT")
                                         }} />

                                    </div>

                                </Authorize>

                            </td>
                        </tr>
                    ))

                }

                </tbody>
            </table>

        </div>

    </div>
}
export default MembersInfo
