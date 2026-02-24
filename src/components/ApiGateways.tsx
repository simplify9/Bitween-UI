import React, {useState} from "react";
import {useApiGatewaysQuery} from "src/client/apis/apiGatewaysApi";
import Authorize from "src/components/common/authorize/authorize";
import {ApiGatewaysList} from "src/components/ApiGateways/ApiGatewaysList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateApiGatewayModal from "src/components/ApiGateways/CreateApiGatewayModal";
import Button from "src/components/common/forms/Button";

const ApiGateways: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const data = useApiGatewaysQuery();

    return <div>
        {openModal === "CREATE" && <CreateApiGatewayModal onClose={() => setOpenModal("NONE")}/>}

        <div className="flex flex-col w-full pt-2 pb-10 md:max-w-[1000px]">
            <div className="flex flex-row-reverse justify-between w-full items-center shadow-lg p-2 my-2 rounded-lg bg-white">
                <div>
                    <Authorize roles={["Admin", "Member"]}>
                        <Button onClick={() => setOpenModal("CREATE")}>Add</Button>
                    </Authorize>
                </div>
            </div>

            {data.data &&
                <div className="shadow-lg rounded-xl overflow-x-scroll xl:overflow-x-hidden mx-2 pt-5 md:max-w-[1000px]">
                    <ApiGatewaysList data={data.data.result}/>
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

export default ApiGateways;
