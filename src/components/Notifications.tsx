import React, {useState} from "react";
import {useNotificationsQuery} from "src/client/apis/notifiersApi";
import {BaseSearchModel} from "src/types/common";
import {DataListViewSettingsEditor} from "src/components/common/DataListViewSettingsEditor";
import NotificationList from "src/components/Notifications/NotificationList";

const Notifications: React.FC = () => {
    const [searchState, setSearchState] = useState<BaseSearchModel>({limit: 20, offset: 0});
    const data = useNotificationsQuery(searchState)

    return <div className="flex flex-col w-full   md:max-w-[1000px]">

        {data.data
            &&
            <div className={"shadow-lg  rounded-xl overflow-scroll md:overflow-hidden mx-2 pt-5"}>
                <NotificationList data={data.data.result}/>
                <DataListViewSettingsEditor
                    total={data.data.totalCount}
                    offset={searchState.offset}
                    limit={searchState.limit}
                    onChange={(e) => setSearchState({offset: e.offset, limit: e.limit})}
                />
            </div>

        }

    </div>

}
export default Notifications