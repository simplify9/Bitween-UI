import React from "react";
import MembersInfo from "src/components/Settings/MembersInfo";
import Authorize from "src/components/common/authorize/authorize";


const Team: React.FC = () => {
    return <div className={""}>


        <div className={"mt-2 max-w-[1200px]"}>
            <Authorize roles={["Admin"]}>
                <MembersInfo/>
            </Authorize>
        </div>
    </div>
}

export default Team