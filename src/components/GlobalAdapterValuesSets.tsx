import React, {useState} from "react";
import {useGlobalAdapterValuesSetsQuery} from "src/client/apis/globalAdapterValuesSetsApi";
import Authorize from "src/components/common/authorize/authorize";
import {GlobalAdapterValuesSetsSearchModel} from "src/types/globalAdapterValuesSets";
import {GlobalAdapterValuesSetsList} from "src/components/GlobalAdapterValuesSets/GlobalAdapterValuesSetsList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateGlobalAdapterValuesSetModal from "src/components/GlobalAdapterValuesSets/CreateGlobalAdapterValuesSetModal";
import Button from "src/components/common/forms/Button";

const GlobalAdapterValuesSets: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const [searchState, setSearchState] = useState<GlobalAdapterValuesSetsSearchModel>({limit: 20, offset: 0});
    const data = useGlobalAdapterValuesSetsQuery(searchState)

    return <div>
            {
                openModal === "CREATE" && <CreateGlobalAdapterValuesSetModal onClose={() => setOpenModal("NONE")}/>
            }
            <div className="flex flex-col w-full pt-2 pb-10 md:max-w-[1000px]">
                <div
                    className="flex flex-row-reverse justify-between w-full items-center shadow-lg p-2 my-2  rounded-lg bg-white ">

                    <div>
                        <Authorize roles={["Admin", "Member"]}>

                            <Button onClick={() => setOpenModal("CREATE")}
                            >
                                Add
                            </Button>
                        </Authorize>
                    </div>

                </div>


                {data.data
                    &&
                    <div className={"shadow-lg  rounded-xl overflow-x-scroll xl:overflow-x-hidden mx-2 pt-5 md:max-w-[1000px]"}>
                        <GlobalAdapterValuesSetsList data={data.data.result}/>
                        <DataListViewSettingsEditor
                            total={data.data.totalCount}
                            offset={searchState.offset}
                            limit={searchState.limit}
                            onChange={(e) => setSearchState({offset: e.offset, limit: e.limit})}
                        />
                    </div>

                }

            </div>
    </div>
}

export default GlobalAdapterValuesSets;
