import React from "react";
import {DelayedRetriesSearchModel} from "src/types/delayedRetries";
import FormField from "src/components/common/forms/FormField";
import TextEditor from "src/components/common/forms/TextEditor";
import DateEditor from "src/components/common/forms/DateEditor";
import Button from "src/components/common/forms/Button";
import SubscriptionSelector from "src/components/Subscriptions/SubscriptionSelector";
import DocumentSelector from "src/components/Documents/DocumentSelector";

interface Props {
    value: DelayedRetriesSearchModel;
    onChange: (value: DelayedRetriesSearchModel) => void;
    onSearch?: (value: DelayedRetriesSearchModel) => void;
    onFindRequested: () => void;
    onClear: () => void;
}

export const ScheduledRetriesFinderPanel: React.FC<Props> = ({
                                                                   value,
                                                                   onChange,
                                                                   onSearch,
                                                                   onFindRequested,
                                                                   onClear,
                                                               }) => {
    const handleSearch = onSearch ?? onChange;
    const handleFind = (e) => {
        e.preventDefault();
        onFindRequested();
    };

    const activeFilterCount = [
        value.subscription,
        value.documentId,
        value.exception,
        value.scheduledFrom,
        value.scheduledTo,
    ].filter(v => v !== undefined && v !== null && v !== '').length;

    return (
        <div className={"shadow px-3 mb-2 rounded-lg bg-white"} style={{zIndex: 1000}}>
            <div className="flex flex-col py-2 z-50 gap-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                    <FormField title="Subscription" tooltip="Filter by the subscription the scheduled retry belongs to">
                        <SubscriptionSelector
                            value={value.subscription}
                            onChange={(subscription) => handleSearch({...value, subscription: subscription || undefined})}
                        />
                    </FormField>
                    <FormField title="Document" tooltip="Filter by document type">
                        <DocumentSelector
                            value={value.documentId?.toString()}
                            onChange={(t) => handleSearch({...value, documentId: t ? Number(t) : undefined})}
                        />
                    </FormField>
                    <FormField title="Exception" tooltip="Filter by text contained in the original failure's exception message">
                        <TextEditor
                            placeholder="e.g. TimeoutException"
                            value={value.exception}
                            onChange={(t) => onChange({...value, exception: t})}
                            onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                        />
                    </FormField>
                    <FormField
                        title="Scheduled From"
                        tooltip="Show retries scheduled to run on or after this date"
                        actionTitle={value.scheduledFrom ? "✕" : undefined}
                        onClickAction={value.scheduledFrom ? () => handleSearch({...value, scheduledFrom: undefined}) : undefined}
                    >
                        <DateEditor
                            onChange={(t) => handleSearch({...value, scheduledFrom: t})}
                            value={value.scheduledFrom}
                            maxDate={value.scheduledTo}
                        />
                    </FormField>
                    <FormField
                        title="Scheduled To"
                        tooltip="Show retries scheduled to run on or before this date — set to today to see overdue retries"
                        actionTitle={value.scheduledTo ? "✕" : undefined}
                        onClickAction={value.scheduledTo ? () => handleSearch({...value, scheduledTo: undefined}) : undefined}
                    >
                        <DateEditor
                            onChange={(t) => handleSearch({...value, scheduledTo: t})}
                            value={value.scheduledTo}
                            minDate={value.scheduledFrom}
                        />
                    </FormField>
                </div>

                <div className="flex flex-row items-center justify-end border-t border-gray-100 pt-2 gap-x-2">
                    {activeFilterCount > 0 && (
                        <span className="text-xs text-primary-600 font-medium whitespace-nowrap">
                            {activeFilterCount} active
                        </span>
                    )}
                    <Button variant={"secondary"} onClick={onClear}>Clear</Button>
                    <Button onClick={handleFind}>Search</Button>
                </div>
            </div>
        </div>
    );
};

export default ScheduledRetriesFinderPanel;
