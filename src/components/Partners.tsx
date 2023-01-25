import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState} from "react";
import {jsBoolean, jsNumber, jsString} from "redux-ecq";
import {usePartnerFinder} from "../hooks/queryHooks";
import {PartnerList} from "./Partners/PartnerList";
import {PartnerFinderPanel} from "./Partners/PartnerFinderPanel";
import CreateNewPartner from "./Partners/CreateNewPartner";
import {apiClient} from "../client";


interface Props {

}

const defaultQuery = {
    nameContains: "",
    offset: 0,
    limit: 20,
    sortBy: "docType",
    sortByDescending: false
}

const queryStringMapping = {
    nameContains: jsString(),
    sortBy: jsString(),
    sortByDescending: jsBoolean(),
    offset: jsNumber(),
    limit: jsNumber()
}

const useQuery = usePartnerFinder;

export type PartnerSpecs = {
    nameContains: string
}

export default (props: Props) => {

    const [creatingOn, setCreatingOn] = useState(false);

    const [queryState, newQuery] = useQuery(defaultQuery);

    const [findSpecs, setFindSpecs] = useState<PartnerSpecs>({
        nameContains: queryState.lastSent.nameContains ?? "",
    });

    const handleFindRequested = () => {
        console.log("findspecs", findSpecs)
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
            sortBy: viewOptions.sortBy.field,
            sortByDescending: !!viewOptions.sortBy.descending,
            offset: viewOptions.offset,
            limit: viewOptions.limit
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
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div
                        className="text-2xl font-bold tracking-wide text-gray-700">Partners
                    </div>
                    <button onClick={() => setCreatingOn(true)}
                            className="bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded">
                        Create New Partner
                    </button>
                </div>
                <PartnerFinderPanel value={findSpecs} onChange={setFindSpecs}
                                    onFindRequested={handleFindRequested}/>
                {queryState.response !== null
                    ? <>
                        <DataListViewSettingsEditor
                            sortByOptions={["name"]}
                            sortByTitles={{
                                docType: "Partner Type"
                            }}
                            sortBy={{
                                field: queryState.lastSent.sortBy,
                                descending: queryState.lastSent.sortByDescending
                            }}
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                        <PartnerList data={queryState.response.data}/>
                    </>
                    : null}

            </div>

            {creatingOn && <CreateNewPartner onAdd={createPartner}
                                             onClose={() => setCreatingOn(false)}/>}
        </>
    )
}



