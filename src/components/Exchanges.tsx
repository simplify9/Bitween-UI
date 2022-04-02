import { useState } from "react";
import { DataListViewSettingsEditor, DataListViewSettings } from "./common/DataListViewSettingsEditor";
import { ExchangeFinderPanel, ExchangeSpecs } from "./exchanges/ExchangeFinderPanel";
import { ExchangeList } from "./exchanges/ExchangeList";


interface Props {

}

const Component = ({}:Props) => {

    const [findSpecs, setFindSpecs] = useState<ExchangeSpecs>({
        findMode: "keyword",
        keywords: "",
        findBy: {
            subscription: "",
            creationTimeWindow: { },
            status: ""
        }
    });

    const [viewSettings, setViewSettings] = useState<DataListViewSettings>({
        offset: 0,
        limit: 20,
        sortBy: { field: "subscription", descending: true }
    });

    return (
        <div className="flex flex-col w-full px-8 py-4">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Exchanges</div>
                <div className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                    Create New Exchange
                </div>
            </div>
            <ExchangeFinderPanel value={findSpecs} onChange={setFindSpecs} onFindRequested={q => {}} />
            
            <DataListViewSettingsEditor 
                sortByOptions={["subscription", "status", "doctype" ]}
                sortByTitles={{ 
                    "subscription": "Subscription",
                    "status": "Delivery Status",
                    "doctype": "Document Type"
                }}
                sortBy={viewSettings.sortBy}
                total={47} 
                offset={viewSettings.offset} 
                limit={viewSettings.limit} 
                onChange={setViewSettings} />
            
            <ExchangeList data={[]} />
        </div>
    )
}

export default Component;



