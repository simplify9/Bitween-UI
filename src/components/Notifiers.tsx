import React, {Fragment, useState} from "react";
import {useNotifiersQuery} from "src/client/apis/notifiersApi";
import Authorize from "src/components/common/authorize/authorize";
import {NotifiersSearchModel} from "src/types/notifiers";
import {NotifiersList} from "src/components/Notifiers/NotifiersList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateNotifierModal from "src/components/Notifiers/CreateNotifierModal";

const Notifiers: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const [searchState, setSearchState] = useState<NotifiersSearchModel>({limit: 20, offset: 0});
    const data = useNotifiersQuery(searchState)

    return <div>
        <>
            {
                openModal === "CREATE" && <CreateNotifierModal onClose={() => setOpenModal("NONE")}/>
            }
            <div className="flex flex-col w-full px-8 py-4">
                <div className="justify-between w-full flex py-4">
                    <div
                        className="text-2xl font-bold tracking-wide text-gray-700">
                        Notifiers
                    </div>
                    <Authorize roles={["Admin", "Editor"]}>
                        <button onClick={() =>setOpenModal("CREATE")}
                                className="bg-blue-900 hover:bg-blue-900 text-white py-2 px-4 rounded">
                            Create New Notifier
                        </button>
                    </Authorize>
                </div>
                {data.data
                    &&
                    <div className={"mt-10"}>
                        <NotifiersList data={data.data.result}/>
                        <DataListViewSettingsEditor
                            total={data.data.totalCount}
                            offset={searchState.offset}
                            limit={searchState.limit}
                            onChange={(e) => setSearchState({offset: e.offset, limit: e.limit})}
                        />
                    </div>

                }

            </div>


        </>
    </div>
}

export default Notifiers