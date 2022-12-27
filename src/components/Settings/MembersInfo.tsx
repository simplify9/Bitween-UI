import React, {useState} from "react";
import {useMembersFinder} from "src/hooks/queryHooks";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import AddMemberModal from "src/components/Settings/AddMemberModal";
import {AccountModel} from "src/types/accounts";

const useQuery = useMembersFinder;

const defaultQuery = {
    offset: 0,
    limit: 20,
}
const MembersInfo: React.FC = () => {

    const [queryState, newQuery] = useQuery(defaultQuery);
    const [openModal, setOpenModal] = useState<"NONE" | "ADD">("NONE");
    console.log(queryState.response?.data)
    return <div className={"p-3 shadow-lg rounded-lg md:w-1/2"}>
        {
            openModal === "ADD" && <AddMemberModal onClose={() => {
                newQuery(defaultQuery)
                setOpenModal("NONE")
            }}/>
        }
        <div className={"flex justify-between"}>
            <span className={"text-lg"}>
                        Members Info
            </span>
            <button onClick={() => setOpenModal("ADD")}
                    className="bg-blue-600 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Add
            </button>

        </div>
        <div className="pt-3 w">
            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Name
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Email
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        CreatedOn
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    queryState.response?.data?.result?.map((i: AccountModel) => (
                        <tr key={i.email} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {i.name}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {i.email}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                {toLocalDateTimeString(i.createdOn)}
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