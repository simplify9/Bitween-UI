import React, {useState} from "react";
import {TrailBaseModel} from "src/types/trail";
import {toLocalDateTimeString} from "src/utils/DateUtils";
import TrailDiffModal from "src/components/common/trails/trailDiffModal";
import {useMembersFinder} from "src/hooks/queryHooks";
import Button from "src/components/common/forms/Button";

const useQuery = useMembersFinder;
const defaultQuery = {
    offset: 0,
    limit: 100,
    lookup: true
}
type Props = {
    data: Array<TrailBaseModel>
}
const TrailsTable: React.FC<Props> = ({data}) => {
    const [queryState, newQuery] = useQuery(defaultQuery);

    const [showDiffFor, setShowDiffFor] = useState<null | TrailBaseModel>(null);
    return <div>
        {showDiffFor && <TrailDiffModal onClose={() => setShowDiffFor(null)} newData={showDiffFor.stateAfter}
                                        oldData={showDiffFor.stateBefore}/>}
        <div>
            <h5 className={"text-lg font-bold pb-3"}>
                Trails
            </h5>
        </div>
        <table className="appearance-none min-w-full">
            <thead className="border-y bg-gray-50">
            <tr>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Code
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Created on
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">
                    Created by
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-1 text-left">

                </th>
            </tr>
            </thead>
            <tbody>
            {
                data.map((i) => (
                    <tr key={i.id} className="bg-white border-b">
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {i.code}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {toLocalDateTimeString(i.createdOn)}
                        </td>
                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            {queryState.response?.data?.[i.createdBy]}
                        </td>

                        <td className="text-sm text-gray-900 font-light px-6 py-1 whitespace-nowrap">
                            <Button onClick={() => {
                                setShowDiffFor(i)
                            }}>
                                View diff
                            </Button>
                        </td>
                    </tr>
                ))

            }

            </tbody>
        </table>
    </div>
}
export default TrailsTable