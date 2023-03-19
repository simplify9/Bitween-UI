import React from "react";
import {useAppVersionFinder} from "src/hooks/queryHooks";
import Profile from "src/components/Settings/Profile";

const useQuery = useAppVersionFinder;

const Settings: React.FC = () => {
    const [versionQueryState, newVersionQueryQuery] = useQuery({});
    return <div className={"px-3"}>

        <div className={"flex flex-row "}>
            <div className={"shadow-lg bg-white rounded-2xl w-1/4 p-5 min-h-[100px] mt-10"}>
                <div className={"pb-3"}>
                    <h3 className={"text-lg"}>Deployment Info</h3>
                </div>
                <div>
                    Infolink Version : {versionQueryState.response?.data?.infolinkApiVersion}
                </div>
            </div>
            <div className={"mx-5"}>
                <Profile/>
            </div>
        </div>


    </div>
}

export default Settings