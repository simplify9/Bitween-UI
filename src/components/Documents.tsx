import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useState} from "react";
import {jsBoolean, jsNumber, jsString} from "redux-ecq";
import {withUrlSupport} from "../hooks/queryUrlHooks";
import {useDocumentFinder} from "../hooks/queryHooks";
import {DateTimeRange} from "./common/forms/DateTimeRangeEditor";
import {DocumentList} from "./Documents/DocumentList";
import {DocumentFinderPanel} from "./Documents/DocumentFinderPanel";
import {apiClient} from "../client";
import {CreateDocument} from "../types/document";
import CreateNewDocument from "./Documents/CreateNewDocument";
import Button from "./common/forms/Button";


interface Props {

}

const defaultQuery = {
    mode: "keyword",
    creationDateFrom: undefined,
    creationDateTo: undefined,
    keywords: "",
    offset: 0,
    limit: 20,
    sortBy: "docType",
    sortByDescending: false
}

const queryStringMapping = {
    keywords: jsString(),
    creationDateFrom: jsString(),
    creationDateTo: jsString(),
    mode: jsString(),
    sortBy: jsString(),
    sortByDescending: jsBoolean(),
    offset: jsNumber(),
    limit: jsNumber()
}

const useQuery = useDocumentFinder;

export type DocumentSpecs = {
    findMode: string
    keywords: string
    findBy: DocumentFindBySpecs
}
export type DocumentFindBySpecs = {
    creationTimeWindow: DateTimeRange
}

export default (props: Props) => {
    const [queryState, newQuery] = useQuery(defaultQuery);
    const [creatingOn, setCreatingOn] = useState(false);
    const [findSpecs, setFindSpecs] = useState<DocumentSpecs>({
        findMode: queryState.lastSent.mode,
        keywords: queryState.lastSent.keywords ?? "",
        findBy: {
            creationTimeWindow: {
                from: queryState.lastSent.creationDateFrom,
                to: queryState.lastSent.creationDateTo
            },
        }
    });

    const handleFindRequested = (findSpecs: DocumentSpecs) => {
        newQuery({
            ...defaultQuery,
            ...queryState.lastSent,
            mode: findSpecs.findMode,
            keywords: findSpecs.keywords,
            creationDateFrom: findSpecs.findBy.creationTimeWindow.from,
            creationDateTo: findSpecs.findBy.creationTimeWindow.to,
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

    const createDocument = async (document:CreateDocument) => {
        let res = await apiClient.createDocument(document);
        if (res.succeeded)
        {
            setCreatingOn(false);
            newQuery(queryState.lastSent)
        }
    }

    return (
        <>
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div className="text-2xl font-bold tracking-wide text-gray-700">Documents</div>
                    <Button onClick={() => setCreatingOn(true)} className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                        Create New Document
                    </Button>
                </div>
                <DocumentFinderPanel value={findSpecs} onChange={setFindSpecs} onFindRequested={handleFindRequested}/>
                {queryState.response !== null
                    ? <>
                        <DataListViewSettingsEditor
                            sortByOptions={["name"]}
                            sortByTitles={{
                                docType: "Document Type"
                            }}
                            sortBy={{
                                field: queryState.lastSent.sortBy,
                                descending: queryState.lastSent.sortByDescending
                            }}
                            total={queryState.response.total}
                            offset={queryState.lastSent.offset}
                            limit={queryState.lastSent.limit}
                            onChange={handleViewOptionsChange}/>
                        <DocumentList data={queryState.response.data}/>
                    </>
                    : null}

            </div>
            {creatingOn && <CreateNewDocument onAdd={createDocument} onClose={() => setCreatingOn(false)}/>}
        </>
    )
}



