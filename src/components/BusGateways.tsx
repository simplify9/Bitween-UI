import React, {useState} from "react";
import {useBusGatewaysQuery} from "src/client/apis/busGatewaysApi";
import Authorize from "src/components/common/authorize/authorize";
import {BusGatewaysList} from "src/components/BusGateways/BusGatewaysList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateBusGatewayModal from "src/components/BusGateways/CreateBusGatewayModal";
import Button from "src/components/common/forms/Button";

const BusGateways: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const data = useBusGatewaysQuery();

    return <div>
        {openModal === "CREATE" && <CreateBusGatewayModal onClose={() => setOpenModal("NONE")}/>}

        <div className="flex flex-col w-full pt-2 pb-10 md:max-w-[1000px]">
            <div className="flex justify-between items-center gap-4 w-full shadow-lg p-3 my-2 rounded-lg bg-white">
                <p className="text-sm text-gray-500">Route incoming bus messages to subscriptions by filter.</p>
                <Authorize roles={["Admin", "Member"]}>
                    <Button onClick={() => setOpenModal("CREATE")}>Add</Button>
                </Authorize>
            </div>

            {data.data &&
                <div className="shadow-lg rounded-xl overflow-x-scroll xl:overflow-x-hidden mx-2 pt-5 md:max-w-[1000px]">
                    <BusGatewaysList data={data.data.result}/>
                    <DataListViewSettingsEditor
                        total={data.data.totalCount}
                        offset={0}
                        limit={data.data.totalCount}
                        onChange={() => {}}
                    />
                </div>
            }
        </div>
    </div>
}

export default BusGateways;
