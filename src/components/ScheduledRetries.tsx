import React, {useCallback, useEffect} from "react";
import {useLazyDelayedRetriesQuery} from "src/client/apis/delayedRetriesApi";
import {DelayedRetriesSearchModel} from "src/types/delayedRetries";
import {ScheduledRetriesList} from "src/components/ScheduledRetries/ScheduledRetriesList";
import {ScheduledRetriesFinderPanel} from "src/components/ScheduledRetries/ScheduledRetriesFinderPanel";
import {DataListViewSettings, DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import {useUrlParams} from "src/hooks/useUrlParams";

const defaultQuery: DelayedRetriesSearchModel = {
    offset: 0,
    limit: 20,
    subscription: undefined,
    documentId: undefined,
    exception: undefined,
    scheduledFrom: undefined,
    scheduledTo: undefined,
};

const ScheduledRetries: React.FC = () => {

    const [findSpecs, updateUrlParams, clearUrlParams] = useUrlParams<DelayedRetriesSearchModel>(defaultQuery);
    const [fetch, data] = useLazyDelayedRetriesQuery();

    useEffect(() => {
        fetch(findSpecs)
    }, [findSpecs.offset, findSpecs.limit]);

    const handleFindRequested = useCallback(() => {
        fetch(findSpecs)
    }, [findSpecs, fetch]);

    const onClear = useCallback(() => {
        clearUrlParams();
        fetch(defaultQuery);
    }, [clearUrlParams, fetch]);

    const onChangeFindSpecs = useCallback((spec: DelayedRetriesSearchModel) => {
        updateUrlParams({...spec, limit: defaultQuery.limit, offset: defaultQuery.offset});
    }, [updateUrlParams]);

    const onSearch = useCallback((spec: DelayedRetriesSearchModel) => {
        const newSpecs = {...spec, limit: defaultQuery.limit, offset: defaultQuery.offset};
        updateUrlParams(newSpecs);
        fetch(newSpecs);
    }, [updateUrlParams, fetch]);

    const onChangePaging = useCallback((spec: DataListViewSettings) => {
        updateUrlParams({...findSpecs, ...spec});
    }, [findSpecs, updateUrlParams]);

    return (
        <div className="flex flex-col w-full pt-2 pb-10 md:max-w-[1200px]">
            <ScheduledRetriesFinderPanel
                value={findSpecs}
                onChange={onChangeFindSpecs}
                onSearch={onSearch}
                onFindRequested={handleFindRequested}
                onClear={onClear}
            />

            {!data.data && data.isFetching && (
                <div className="flex justify-center items-center py-16">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
                </div>
            )}

            {data.data && (
                <div className={"shadow-lg rounded-xl overflow-x-scroll xl:overflow-x-hidden mx-2 pt-5 md:max-w-[1200px]"}>
                    {data.data.result.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <p className="text-sm text-gray-400">No scheduled retries match your current filters.</p>
                            <button
                                onClick={onClear}
                                className="text-xs text-primary-600 hover:text-primary-800 font-medium underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <ScheduledRetriesList data={data.data.result}/>
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
    );
};

export default ScheduledRetries;
