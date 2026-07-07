import React, {useState} from "react";
import {useRetryPoliciesQuery} from "src/client/apis/retryPoliciesApi";
import Authorize from "src/components/common/authorize/authorize";
import {RetryPoliciesSearchModel} from "src/types/retryPolicies";
import {RetryPoliciesList} from "src/components/RetryPolicies/RetryPoliciesList";
import {DataListViewSettingsEditor} from "./common/DataListViewSettingsEditor";
import CreateRetryPolicyModal from "src/components/RetryPolicies/CreateRetryPolicyModal";
import Button from "src/components/common/forms/Button";

const RetryPolicies: React.FC = () => {

    const [openModal, setOpenModal] = useState<"NONE" | "CREATE">("NONE");
    const [searchState, setSearchState] = useState<RetryPoliciesSearchModel>({limit: 20, offset: 0});
    const data = useRetryPoliciesQuery(searchState)

    return <div>
            {
                openModal === "CREATE" && <CreateRetryPolicyModal onClose={() => setOpenModal("NONE")}/>
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
                        <RetryPoliciesList data={data.data.result}/>
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

export default RetryPolicies;
