import {ExchangeFindQuery} from "src/types/xchange";
import React from "react";
import FormField from "src/components/common/forms/FormField";
import SubscriptionSelector from "src/components/Subscriptions/SubscriptionSelector";
import DateEditor from "src/components/common/forms/DateEditor";
import TextEditor from "src/components/common/forms/TextEditor";
import Button from "src/components/common/forms/Button";
import ChoiceEditor from "src/components/common/forms/ChoiceEditor";
import DocumentSelector from "../Documents/DocumentSelector";
import ENV from "src/env";
import PartnerSelector from "src/components/Partners/PartnerSelector";

interface Props {
    value: ExchangeFindQuery;
    onChange: (value: ExchangeFindQuery) => void;
    onSearch?: (value: ExchangeFindQuery) => void;
    onFindRequested: () => void;
    onClear: () => void;
    onBulkRetry: () => void;
    onCreateXchange: () => void;
    isItemsSelected: boolean;
}

type DeliveryStatus = {
    id: string;
    title: string;
};

export const ExchangeFinderPanel: React.FC<Props> = ({
                                                         value,
                                                         onChange,
                                                         onSearch,
                                                         onFindRequested,
                                                         onClear,
                                                         onCreateXchange,
                                                         onBulkRetry,
                                                         isItemsSelected,
                                                     }) => {
    const handleSearch = onSearch ?? onChange;
    const handleFind = (e) => {
        e.preventDefault();
        onFindRequested();
    };

    const activeFilterCount = [
        value.subscription,
        value.documentId,
        value.partnerId,
        value.status,
        value.ids,
        value.correlationId,
        value.promotedProperties,
        value.creationDateFrom,
        value.creationDateTo,
    ].filter(v => v !== undefined && v !== null && v !== '').length;

    return (
        <div
            className={"shadow px-3 mb-2 rounded-lg bg-white"}
            style={{zIndex: 1000}}
        >
            <div className="flex flex-col py-2 z-50 gap-y-2">
                {/* Filter grid — 3 cols × 3 rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
                    <FormField title="Target Subscription" tooltip="Filter by the target subscription">
                        <SubscriptionSelector
                            value={value.subscription}
                            onChange={(subscription) =>
                                handleSearch({...value, subscription: subscription || undefined})
                            }
                        />
                    </FormField>
                    <FormField title="Partner" tooltip="Filter by the sending/receiving partner">
                        <PartnerSelector
                            value={value.partnerId?.toString()}
                            onChange={(t) =>
                                handleSearch({
                                    ...value,
                                    partnerId: t ? Number(t) : undefined,
                                })
                            }
                        />
                    </FormField>
                    <FormField title="Document" tooltip="Filter by document type">
                        <DocumentSelector
                            value={value.documentId?.toString()}
                            onChange={(t) =>
                                handleSearch({
                                    ...value,
                                    documentId: t ? Number(t) : undefined,
                                })
                            }
                        />
                    </FormField>
                    <FormField title="Delivery Status" tooltip="Filter by the final delivery status of the exchange">
                        <ChoiceEditor
                            placeholder="All statuses"
                            isClearable
                            value={value.status}
                            onChange={(status) => handleSearch({...value, status: status || undefined})}
                            optionTitle={(item: DeliveryStatus) => item.title}
                            optionValue={(item: DeliveryStatus) => item.id}
                            options={[
                                {id: "0", title: "Processing"},
                                {id: "1", title: "Success"},
                                {id: "2", title: "Bad response"},
                                {id: "3", title: "Failed"},
                            ]}
                        />
                    </FormField>
                    <FormField
                        title="Creation Time From"
                        tooltip="Show exchanges created after this date"
                        actionTitle={value.creationDateFrom ? "✕" : undefined}
                        onClickAction={value.creationDateFrom ? () => handleSearch({...value, creationDateFrom: undefined}) : undefined}
                    >
                        <DateEditor
                            onChange={(t) => onChange({...value, creationDateFrom: t})}
                            value={value.creationDateFrom}
                            maxDate={value.creationDateTo}
                        />
                    </FormField>
                    <FormField
                        title="Creation Time To"
                        tooltip="Show exchanges created before this date"
                        actionTitle={value.creationDateTo ? "✕" : undefined}
                        onClickAction={value.creationDateTo ? () => handleSearch({...value, creationDateTo: undefined}) : undefined}
                    >
                        <DateEditor
                            onChange={(t) => onChange({...value, creationDateTo: t})}
                            value={value.creationDateTo}
                            minDate={value.creationDateFrom}
                        />
                    </FormField>
                    <FormField title="IDs" tooltip="Filter by one or more exchange IDs — separate with comma, pipe, or newline">
                        <TextEditor
                            placeholder="Comma, pipe or newline separated"
                            value={value.ids}
                            onChange={(t) => onChange({...value, ids: t})}
                            onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                        />
                    </FormField>
                    <FormField title="Correlation ID" tooltip="Filter by the correlation ID from the originating request">
                        <TextEditor
                            placeholder="Correlation ID"
                            value={value.correlationId}
                            onChange={(t) => onChange({...value, correlationId: t})}
                            onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                        />
                    </FormField>
                    <FormField title="Promoted Properties" tooltip="Filter by custom key=value properties promoted on the exchange">
                        <TextEditor
                            placeholder="e.g. key=value"
                            value={value.promotedProperties}
                            onChange={(t) => onChange({...value, promotedProperties: t})}
                            onKeyDown={(e) => e.key === 'Enter' && onFindRequested()}
                        />
                    </FormField>
                </div>

                {/* Footer action bar */}
                <div className="flex flex-row items-center justify-between border-t border-gray-100 pt-2">
                    {/* Left — actions */}
                    <div className="flex flex-row items-center gap-x-2">
                        <Button onClick={onCreateXchange}>Create Xchange</Button>
                        {isItemsSelected && (
                            <Button onClick={onBulkRetry}>Bulk retry</Button>
                        )}
                    </div>

                    {/* Centre — live refresh setting */}
                    <div className="flex items-center gap-x-2 text-xs text-gray-400">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">Refresh every</span>
                        <div className="w-36">
                            <ChoiceEditor
                                placeholder="interval"
                                isClearable={false}
                                value={value.fetchInterval?.toString()}
                                onChange={(fetchInterval) => onChange({...value, fetchInterval: Number(fetchInterval)})}
                                optionTitle={(item: DeliveryStatus) => item.title}
                                optionValue={(item: DeliveryStatus) => String(item.id)}
                                options={ENV.CONFIG.XCHANGE_REFRESH_DEFAULT_INTERVAL_OPTIONS}
                            />
                        </div>
                    </div>

                    {/* Right — filter actions */}
                    <div className="flex flex-row items-center gap-x-2">
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
        </div>
    );
};
