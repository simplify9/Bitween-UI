import Tab from "../common/forms/Tab";
import TabNavigator from "../common/forms/TabNavigator";
import {SubscriptionSpecs} from "../Subscriptions";



interface Props {
    value: SubscriptionSpecs
    onChange: (value:SubscriptionSpecs) => void
    onFindRequested: (specs:SubscriptionSpecs) => void
}

export const SubscriptionFinderPanel:React.FC<Props> = ({
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



