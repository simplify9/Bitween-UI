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
    promotedProperties: undefined,
    fetchInterval: 5000
}


const Component: React.FC = () => {

    const [selectedRowsIds, setSelectedRowsIds] = useState<Array<string>>([]);
    const [openModal, setOpenModal] = useState<"CREATE_XCHANGE" | "BULK_RETRY" | "NONE">("NONE");
    const [findSpecs, setFindSpecs] = useState<ExchangeFindQuery>(defaultQuery);
    console.log(findSpecs.fetchInterval)
    const [fetch, data] = useLazyXChangesQuery({pollingInterval: findSpecs.fetchInterval, refetchOnFocus: true})

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
        <div className="flex flex-col w-full  py-2">
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

            <ExchangeFinderPanel
                isItemsSelected={selectedRowsIds.length > 0}
                onBulkRetry={() => setOpenModal("BULK_RETRY")}
                onCreateXchange={() => setOpenModal("CREATE_XCHANGE")}
                value={findSpecs}
                onChange={onChangeFindSpecs}
                onClear={onClear}
                onFindRequested={handleFindRequested}
            />
            {data.data &&
                <div className={"shadow-lg  rounded-xl overflow-hidden  "}>
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
                </div>
            }

        </div>
    )
}

export default Component;



