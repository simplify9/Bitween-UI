import {TrailBaseModel} from "src/types/trail";
import React from "react";
import Modal from "src/components/common/Modal";
import TrailsTable from "src/components/common/trails/trailsTable";

type Props = {
    onClose: () => void
    data: Array<TrailBaseModel>
}
const TrialsViewModal: React.FC<Props> = ({onClose, data}) => {


    if (!data)
        return null
    return <Modal title={"Trails"} onClose={onClose}>

        <div>

        </div>
        <div>
            <TrailsTable data={data}/>
        </div>

    </Modal>
}
export default TrialsViewModal