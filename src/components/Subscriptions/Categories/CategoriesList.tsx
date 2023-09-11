import {useDeleteSubscriptionCategoryMutation} from "src/client/apis/subscriptionsApi";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import Button from "src/components/common/forms/Button";
import {MdModeEditOutline, MdOutlineRemoveCircle} from "react-icons/md";
import React, {Fragment, useState} from "react";
import {SubscriptionCategoryModel} from "src/types/subscriptions";
import UpdateCategoryModal from "src/components/Subscriptions/Categories/UpdateCategoryModal";

type Props = {
    data: SubscriptionCategoryModel[]
}
const CategoriesList: React.FC<Props> = (props) => {
    const [deleteCategory] = useDeleteSubscriptionCategoryMutation()
    const [categoryToBeEdited, setCategoryToBeEdited] = useState<SubscriptionCategoryModel | null>(null);
    const onClickDelete = (id: number) => {
        console.log("deleteing")
        deleteCategory({id})
    }
    return (
        <Fragment>

            {categoryToBeEdited &&
                <UpdateCategoryModal category={categoryToBeEdited} onClose={() => setCategoryToBeEdited(null)}/>
            }

            <table className="appearance-none min-w-full">
                <thead className="border-y bg-gray-50">
                <tr>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Code
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Description
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                        Created on
                    </th>
                    <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-2 text-left">
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    props.data?.map((i) => (
                        <tr key={i.id} className="bg-white border-b">
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.code}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {i.description}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                {toLocalDateTimeString(i.createdOn)}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                <div className={"flex flex-row gap-3"}>
                                    
                                <Button variant={"none"} onClick={() => onClickDelete(i.id)}
                                >
                                    <div className={"text-red-600"}>
                                        <MdOutlineRemoveCircle size={21}/>
                                    </div>
                                </Button>
                                <Button variant={"none"} onClick={() => setCategoryToBeEdited(i)}
                                >
                                    <div className={"text-yellow-400"}>
                                        <MdModeEditOutline size={21}/>
                                    </div>
                                    
                                </Button>
                                </div>
                            </td>
                        </tr>
                    ))

                }

                </tbody>
            </table>
        </Fragment>
    )
}

export default CategoriesList