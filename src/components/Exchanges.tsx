import React, {useCallback, useEffect, useState} from "react";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {ExchangeFinderPanel} from "./exchanges/ExchangeFinderPanel";
import {ExchangeList} from "./exchanges/ExchangeList";
import BulkRetryModal from "src/components/exchanges/BulkRetryModal";
import CreateExchange from "src/components/exchanges/CreateExchange";
import {useLazyXChangesQuery} from "src/client/apis/xchangeApi";
import {ExchangeFindQuery} from "src/types/xchange";


const defaultQuery: ExchangeFindQuery = {
    subscription: undefined,
    status: undefined,
    creationDateTo: undefined,
    creationDateFrom: undefined,
    offset: 0,
    limit: 20,
    correlationId: undefined,
    id: undefined,
    promotedProperties: undefined
}


const Component: React.FC = () => {

    const [selectedRowsIds, setSelectedRowsIds] = useState<Array<string>>([]);
    const [openModal, setOpenModal] = useState<"CREATE_XCHANGE" | "BULK_RETRY" | "NONE">("NONE");
    const [findSpecs, setFindSpecs] = useState<ExchangeFindQuery>(defaultQuery);
    const [fetch, data] = useLazyXChangesQuery({pollingInterval: 5000, refetchOnFocus: true})

    useEffect(() => {
        fetch(findSpecs)
    }, [findSpecs.offset, findSpecs.limit])


    const handleFindRequested = useCallback(() => {
        fetch(findSpecs)
    }, [findSpecs])

    const onClear = useCallback(() => {
        setFindSpecs(defaultQuery)
        fetch(defaultQuery)
    }, [defaultQuery])

    const onChangeFindSpecs = useCallback((spec: DataListViewSettings | ExchangeFindQuery) => {
        setFindSpecs((s) => ({
            ...s,
            ...spec,
        }));
    }, [])


    return (
        <div className="flex flex-col w-full px-3 py-4">
            {openModal === "BULK_RETRY" && <BulkRetryModal
                xids={selectedRowsIds}
                onRefresh={handleFindRequested}
                onClose={() => {
                    handleFindRequested()
                    setOpenModal("NONE")
                }}
            />}
            {openModal === "CREATE_XCHANGE" && <CreateExchange
                onClose={() => {
                    handleFindRequested()
                    setOpenModal("NONE")
                }}
            />}
            <div className="justify-between w-full flex pt-3">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Xchanges</div>
            </div>
            <div className={"flex flex-row-reverse"}>
                <button
                    onClick={() => setOpenModal("BULK_RETRY")}
                    className="block appearance-none border bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                    Bulk retry
                </button>
                <button
                    onClick={() => setOpenModal("CREATE_XCHANGE")}
                    className="block appearance-none border bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded drop-shadow-sm focus:drop-shadow-lg focus:outline-none">
                    Create Xchange
                </button>
            </div>
            <ExchangeFinderPanel
                value={findSpecs}
                onChange={onChangeFindSpecs}
                onClear={onClear}
                onFindRequested={handleFindRequested}
            />
            {data.data &&
                <>
                    <ExchangeList
                        selectedRowsIds={selectedRowsIds}
                        setSelectedRowsIds={setSelectedRowsIds}
                        data={data.data.result}
                        refresh={handleFindRequested
                        }
                    />
                    <DataListViewSettingsEditor
                        total={data.data.totalCount}
                        offset={findSpecs.offset}
                        limit={findSpecs.limit}
                        onChange={onChangeFindSpecs}
                    />
                </>
            }

        </div>
    )
}

export default Component;



