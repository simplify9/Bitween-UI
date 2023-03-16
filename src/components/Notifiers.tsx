import React, {useState} from "react";
import {useNotifiersQuery} from "src/client/apis/notifiersApi";
import Authorize from "src/components/common/authorize/authorize";
import {NotifiersSearchModel} from "src/types/notifiers";
import {NotifiersList} from "src/components/Notifiers/NotifiersList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateNotifierModal from "src/components/Notifiers/CreateNotifierModal";
import Button from "src/components/common/forms/Button";

const Notifiers: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const [searchState, setSearchState] = useState<NotifiersSearchModel>({limit: 20, offset: 0});
    const data = useNotifiersQuery(searchState)

    return <div>
        <>
            {
                openModal === "CREATE" && <CreateNotifierModal onClose={() => setOpenModal("NONE")}/>
            }
            <div className="flex flex-col w-full pt-2 pb-10 md:max-w-[1000px]">
                <div
                    className="flex flex-row-reverse justify-between w-full items-center shadow-lg p-2 my-2  rounded-lg bg-white ">

                    <div>
                        <Authorize roles={["Admin", "Editor"]}>

                            <Button onClick={() => setOpenModal("CREATE")}
                            >
                                Create
                            </Button>
                        </Authorize>
                    </div>

                </div>


                {data.data
                    &&
                    <div className={"shadow-lg  rounded-xl overflow-hidden mx-2 pt-5"}>
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