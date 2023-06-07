import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState} from "react";
import {useDocumentFinder} from "../hooks/queryHooks";
import {DocumentList} from "./Documents/DocumentList";
import {apiClient} from "../client";
import {CreateDocument} from "../types/document";
import CreateNewDocument from "./Documents/CreateNewDocument";
import Button from "./common/forms/Button";
import Authorize from "src/components/common/authorize/authorize";
import {SubscriptionFinderPanel} from "src/components/Subscriptions/SubscriptionFinder";

const defaultQuery = {
    nameContains: '',
    offset: 0,
    limit: 10,
    orderBy: {
        field: "Name"
    }
}

const useQuery = useDocumentFinder;

export type DocumentSpecs = {
    nameContains: string

}
export default () => {
    const [queryState, newQuery] = useQuery(defaultQuery);
    const [creatingOn, setCreatingOn] = useState(false);
    const [findSpecs, setFindSpecs] = useState<DocumentSpecs>({
        nameContains: queryState.lastSent.nameContains,
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
            limit: viewOptions.limit
        });
    }

    const createDocument = async (document: CreateDocument) => {
        let res = await apiClient.createDocument(document);
        if (res.succeeded) {
            setCreatingOn(false);
            newQuery(queryState.lastSent)
        }
    }

    return (
        <>
            <div className="flex flex-col w-full md:max-w-[1000px]">

                <div className="flex justify-between w-full items-center shadow p-2 my-2  rounded-lg bg-white ">
                    <SubscriptionFinderPanel value={findSpecs} onChange={setFindSpecs}
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
                    ? <div className={"shadow-lg  rounded-xl overflow-hidden  "}>

                        <DocumentList data={queryState.response.data}/>
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
            {creatingOn && <CreateNewDocument onAdd={createDocument} onClose={() => setCreatingOn(false)}/>}
        </>
    )
}



