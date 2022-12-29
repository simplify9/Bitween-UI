import {useMyProfile} from "src/hooks/queryHooks";
import React, {useState} from "react";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import ChangePasswordModal from "src/components/Settings/ChangePasswordModal";

const useQuery = useMyProfile;
const Profile: React.FC = () => {
    const [versionQueryState, newVersionQueryQuery] = useQuery({});
    const [openModal, setOpenModal] = useState<"NONE" | "CHANGE_PASSWORD">("NONE");

    return (<div className={"shadow-lg rounded-2xl p-5 pb-2 min-h-[200px] mt-10 flex flex-col justify-between"}>
        {
            openModal === "CHANGE_PASSWORD" && <ChangePasswordModal onClose={() => setOpenModal("NONE")}/>
        }
        <div className={""}>
            <div>
            <span className={"font-light text-gray-700"}>
                Name: 
            </span>
                <span className={"mx-1"}>
              {versionQueryState.response?.data?.name}
            </span>
            </div>
            <div>
            <span className={"font-light text-gray-700"}>
                Email: 
            </span>
                <span className={"mx-1"}>
              {versionQueryState.response?.data?.email}
            </span>
            </div>
         
        </div>
        <div>
            <span onClick={() => setOpenModal("CHANGE_PASSWORD")} className={"text-gray-700 underline cursor-pointer"}>
                Change your password
            </span>
        </div>
    </div>)
}

export default Profile;