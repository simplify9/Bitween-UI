import React from "react";
import MembersInfo from "src/components/Settings/MembersInfo";
import {useAppVersionFinder} from "src/hooks/queryHooks";
import Profile from "src/components/Settings/Profile";

const useQuery = useAppVersionFinder;

const Settings: React.FC = () => {
    const [versionQueryState, newVersionQueryQuery] = useQuery({});
    return <div className={"p-8"}>
        <div>
            <h1 className={"font-semibold text-2xl"}>
                Settings
            </h1>
        </div>


        <div className={"flex flex-row"}>
            <div className={"shadow-lg rounded-2xl w-1/4 p-5 min-h-[100px] mt-10"}>
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


        <div className={"mt-5"}>
            <MembersInfo/>
        </div>
    </div>
}

export default Settings