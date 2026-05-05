import React, {useCallback, useEffect, useState} from "react";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {ExchangeFinderPanel} from "./exchanges/ExchangeFinderPanel";
import {ExchangeList} from "./exchanges/ExchangeList";
import BulkRetryModal from "src/components/exchanges/BulkRetryModal";
import CreateExchange from "src/components/exchanges/CreateExchange";
import {useLazyXChangesQuery} from "src/client/apis/xchangeApi";
import {ExchangeFindQuery} from "src/types/xchange";
import ENV from "src/env";
import {useUrlParams} from "src/hooks/useUrlParams";


const defaultQuery: ExchangeFindQuery = {
    subscription: undefined,
    status: undefined,
    creationDateTo: undefined,
    creationDateFrom: undefined,
    offset: 0,
    limit: 20,
    correlationId: undefined,
    id: undefined,
    ids: undefined,
    documentId: undefined,
    partnerId: undefined,
    promotedProperties: undefined,
    fetchInterval: ENV.CONFIG.XCHANGE_REFRESH_DEFAULT_INTERVAL
}


const Component: React.FC = () => {

    const [selectedRowsIds, setSelectedRowsIds] = useState<Array<string>>([]);
    const [openModal, setOpenModal] = useState<"CREATE_XCHANGE" | "BULK_RETRY" | "NONE">("NONE");
    const [fetchInterval, setFetchInterval] = useState(defaultQuery.fetchInterval);
    
    // Use URL params hook to sync filters with URL, excluding fetchInterval from URL
    const [findSpecs, updateUrlParams, clearUrlParams] = useUrlParams<ExchangeFindQuery>(
        defaultQuery, 
        ['fetchInterval']
    );
    
    const [fetch, data] = useLazyXChangesQuery({pollingInterval: fetchInterval, refetchOnFocus: true})

    useEffect(() => {
        fetch(findSpecs)
    }, [findSpecs.offset, findSpecs.limit])


    const handleFindRequested = useCallback(() => {
        fetch(findSpecs)
    }, [findSpecs])

    const onClear = useCallback(() => {
        clearUrlParams();
        setFetchInterval(defaultQuery.fetchInterval);
        fetch(defaultQuery)
    }, [clearUrlParams])

    const onChangeFindSpecs = useCallback((spec: ExchangeFindQuery) => {
        if (spec.fetchInterval !== fetchInterval) {
            setFetchInterval(spec.fetchInterval);
        }
        const newSpecs = {
            ...spec,
            limit: defaultQuery.limit,
            offset: defaultQuery.offset
        };
        updateUrlParams(newSpecs);
    }, [updateUrlParams, fetchInterval])

    const onSearch = useCallback((spec: ExchangeFindQuery) => {
        const newSpecs = {
            ...spec,
            limit: defaultQuery.limit,
            offset: defaultQuery.offset
        };
        updateUrlParams(newSpecs);
        fetch(newSpecs);
    }, [updateUrlParams, fetch])

    const onChangePaging = useCallback((spec: DataListViewSettings) => {
        const newSpecs = {
            ...findSpecs,
            ...spec,
        };
        updateUrlParams(newSpecs);
    }, [findSpecs, updateUrlParams])


    return (
        <div className="flex flex-col w-full  ">
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
                value={{...findSpecs, fetchInterval}}
                onChange={onChangeFindSpecs}
                onSearch={onSearch}
                onClear={onClear}
                onFindRequested={handleFindRequested}
            />

            {/* Initial loading — no data yet */}
            {!data.data && data.isFetching && (
                <div className="flex justify-center items-center py-16">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            )}

            {data.data && (
                <div className="relative shadow-lg rounded-xl overflow-scroll xl:overflow-hidden">
                    {/* Thin progress bar at the top — non-blocking refresh indicator */}
                    {data.isFetching && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 overflow-hidden rounded-t-xl bg-primary-100">
                            <div className="h-full bg-primary-500 animate-progress" />
                        </div>
                    )}

                    {data.data.result.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <p className="text-sm text-gray-400">No exchanges match your current filters.</p>
                            <button
                                onClick={onClear}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <ExchangeList
                            selectedRowsIds={selectedRowsIds}
                            setSelectedRowsIds={setSelectedRowsIds}
                            data={data.data.result}
                            refresh={handleFindRequested}
                        />
                    )}

                    <DataListViewSettingsEditor
                        total={data.data.totalCount}
                        offset={findSpecs.offset}
                        limit={findSpecs.limit}
                        onChange={onChangePaging}
                    />
                </div>
            )}

        </div>
    )
}

export default Component;



