import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState} from "react";
import {useDocumentFinder} from "../hooks/queryHooks";
import {DocumentList} from "./Documents/DocumentList";
import {DocumentFinderPanel} from "./Documents/DocumentFinderPanel";
import {apiClient} from "../client";
import {CreateDocument} from "../types/document";
import CreateNewDocument from "./Documents/CreateNewDocument";
import Button from "./common/forms/Button";
import Authorize from "src/components/common/authorize/authorize";


interface Props {

}

const defaultQuery = {
    nameContains: '',
    offset: 0,
    limit: 20,
}


const useQuery = useDocumentFinder;

export type DocumentSpecs = {
    nameContains: string

}


export default (props: Props) => {
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
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div className="text-2xl font-bold tracking-wide text-gray-700">Documents</div>
                    <Authorize roles={['Admin', 'Editor']}>
                        <Button onClick={() => setCreatingOn(true)}
                                className="bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded">
                            Create New Document
                        </Button>
                    </Authorize>

                </div>
                <DocumentFinderPanel value={findSpecs} onChange={setFindSpecs} onFindRequested={handleFindRequested}/>
                {queryState.response !== null
                    ? <>

                        <DocumentList data={queryState.response.data}/>
                        <DataListViewSettingsEditor
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                    </>
                    : null}

            </div>
            {creatingOn && <CreateNewDocument onAdd={createDocument} onClose={() => setCreatingOn(false)}/>}
        </>
    )
}



