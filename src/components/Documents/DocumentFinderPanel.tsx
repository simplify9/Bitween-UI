import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {DocumentSpecs} from "../Documents";



interface Props {
    value: DocumentSpecs
    onChange: (value:DocumentSpecs) => void
    onFindRequested: (specs:DocumentSpecs) => void
}

export const DocumentFinderPanel:React.FC<Props> = ({
                                                        value,
                                                        onChange,
                                                        onFindRequested
                                                    }) => {

    const { findMode } = value;

    const handleModeChange = (findMode: string) => {
        onChange({ ...value, findMode });
    }

    return (
        <>
            <TabNavigator className="w-full">
                <Tab key="keyword" selected={findMode==='keyword'} onClick={() => handleModeChange("keyword")}>Keyword Search</Tab>

            </TabNavigator>


        </>
    )
}



