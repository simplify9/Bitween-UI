import React from "react";
import ReactDiffViewer from 'react-diff-viewer';
import Modal from "src/components/common/Modal";

type Props = {
    oldData: string
    newData: string
    onClose: () => void
}
const TrailDiffModal: React.FC<Props> = ({oldData, newData, onClose}) => {

    if (!oldData || !newData)
        return null

    return <Modal  onClose={onClose}>
        <div className={""}>

            <ReactDiffViewer extraLinesSurroundingDiff={100} oldValue={JSON.stringify(JSON.parse(oldData), null, 4)}
                             newValue={JSON.stringify(JSON.parse(newData), null, 4)}
                             splitView={true}/>
        </div>
    </Modal>
}

export default TrailDiffModal