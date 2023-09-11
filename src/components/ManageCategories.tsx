import {useSubscriptionCategoriesQuery} from "src/client/apis/subscriptionsApi";
import {useState} from "react";
import {SearchSubscriptionCategoryModel} from "src/types/subscriptions";
import CategoriesList from "src/components/Subscriptions/Categories/CategoriesList";
import {DataListViewSettingsEditor} from "src/components/common/DataListViewSettingsEditor";
import Button from "src/components/common/forms/Button";
import CreateCategoryModal from "src/components/Subscriptions/Categories/CreateCategoryModal";

const MangeCategories = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [findSpecs, setFindSpecs] = useState<SearchSubscriptionCategoryModel>({
        limit: 10,
        offset: 0
    });


    const subscriptionCategories = useSubscriptionCategoriesQuery(findSpecs)
    return <div className={"p-10 max-w-[600px]"}>
        {
            isAddModalOpen && <CreateCategoryModal onClose={() => setIsAddModalOpen(false)}/>
        }
        <div className={"flex flex-row justify-end"}>
            <div className={"w-[100px]"}>
                <Button onClick={() => setIsAddModalOpen(true)}>Add</Button>

            </div>
        </div>
        <div className={""}>
            <CategoriesList data={subscriptionCategories.data?.result ?? []}/>
            {
                Boolean(subscriptionCategories.data) && <DataListViewSettingsEditor
                    total={subscriptionCategories.data?.totalCount}
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
export default MangeCategories