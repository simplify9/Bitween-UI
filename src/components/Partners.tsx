import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState} from "react";
import {usePartnerFinder} from "../hooks/queryHooks";
import {PartnerList} from "./Partners/PartnerList";
import CreateNewPartner from "./Partners/CreateNewPartner";
import {apiClient} from "../client";
import Authorize from "src/components/common/authorize/authorize";
import Button from "src/components/common/forms/Button";
import {SubscriptionFinderPanel} from "src/components/Subscriptions/SubscriptionFinder";


interface Props {

}

const defaultQuery = {
    nameContains: "",
    offset: 0,
    limit: 10,
    orderBy: {
        field: "Name"
    }
}

const useQuery = usePartnerFinder;

export type PartnerSpecs = {
    nameContains: string
}

export default () => {

    const [creatingOn, setCreatingOn] = useState(false);

    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<PartnerSpecs>({
        nameContains: queryState.lastSent.nameContains ?? "",
    });

    const handleFindRequested = () => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            nameContains: findSpecs.nameContains,
            offset: 0,
        });
    }
    const handleViewOptionsChange = (viewOptions: DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            offset: viewOptions.offset,
            limit: viewOptions.limit,
            orderBy: viewOptions.orderBy

        });
    }
    const createPartner = async (name: string) => {
        let res = await apiClient.createPartner(name);
        if (res.succeeded) {
            setCreatingOn(false);
            newQuery(queryState.lastSent)
        }
    }

    return (
        <>
            <div className="flex flex-col w-full  md:max-w-[1000px]">


                <div className="flex justify-between w-full items-center shadow p-2 my-2  rounded-lg bg-white ">
                    <SubscriptionFinderPanel value={findSpecs} onChange={setFindSpecs}
                                             onFindRequested={handleFindRequested}/>
                    <div>
                        <Authorize roles={["Admin", "Editor"]}>

                            <Button onClick={() => setCreatingOn(true)}
                            >
                                Add
                            </Button>
                        </Authorize>
                    </div>

                </div>

                {queryState.response !== null
                    ? <div className={"shadow-lg  rounded-xl overflow-hidden  "}>

                        <PartnerList data={queryState.response.data}/>
                        <DataListViewSettingsEditor
                            orderByFields={[{value: "Name", key: "Name"}, {
                                value: "Id",
                                key: "Id"
                            }]}
                            orderBy={queryState.lastSent.orderBy}
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                    </div>
                    : null}

            </div>

            {creatingOn && <CreateNewPartner onAdd={createPartner}
                                             onClose={() => setCreatingOn(false)}/>}
        </>
    )
}



