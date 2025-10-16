import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState, useCallback, useEffect} from "react";
import {usePartnerFinder} from "../hooks/queryHooks";
import {PartnerList} from "./Partners/PartnerList";
import CreateNewPartner from "./Partners/CreateNewPartner";
import {apiClient} from "../client";
import Authorize from "src/components/common/authorize/authorize";
import Button from "src/components/common/forms/Button";
import {PartnersFinderPanel} from "src/components/Subscriptions/PartnersFinder";
import {useUrlParams} from "src/hooks/useUrlParams";


interface Props {

}

const defaultQuery = {
    nameContains: "",
    offset: 0,
    limit: 20,
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

    // Use URL params hook to sync filters with URL
    const [findSpecs, updateUrlParams] = useUrlParams<PartnerSpecs>({
        nameContains: '',
    });

    // Sync URL params with query state on component mount and when findSpecs change
    useEffect(() => {
        if (findSpecs.nameContains !== queryState.lastSent.nameContains) {
            newQuery({
                ...defaultQuery,
                ...queryState.lastSent,
                nameContains: findSpecs.nameContains,
                offset: 0,
            });
        }
    }, [findSpecs.nameContains]);

    const handleFindRequested = useCallback(() => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            nameContains: findSpecs.nameContains,
            offset: 0,
        });
    }, [findSpecs.nameContains, queryState.lastSent]);

    const onChangeFindSpecs = useCallback((specs: PartnerSpecs) => {
        updateUrlParams(specs);
    }, [updateUrlParams]);

    const handleViewOptionsChange = useCallback((viewOptions: DataListViewSettings) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            offset: viewOptions.offset,
            limit: viewOptions.limit,
            orderBy: viewOptions.orderBy

        });
    }, [queryState.lastSent]);

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


                <div className="flex flex-col md:flex-row justify-between w-full items-center shadow p-2 my-2  rounded-lg bg-white ">
                    <PartnersFinderPanel value={findSpecs} onChange={onChangeFindSpecs}
                                         onFindRequested={handleFindRequested}/>
                    <div>
                        <Authorize roles={["Admin", "Member"]}>

                            <Button onClick={() => setCreatingOn(true)}
                            >
                                Add
                            </Button>
                        </Authorize>
                    </div>

                </div>

                {queryState.response !== null
                    ? <div className={"shadow-lg  rounded-xl overflow-scroll xl:overflow-hidden  "}>

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
