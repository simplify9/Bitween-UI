import React, {useCallback, useMemo} from "react";
import {KeyValuePair} from "src/types/common";
import KeyValueEditor from "src/components/common/forms/KeyValueEditor";

type Props = {
  documentFilter?: Array<KeyValuePair>
  promotedProperties?: Array<KeyValuePair>
  onChange: (arr: Array<KeyValuePair>) => void
}
const SubscriptionFilter: React.FC<Props> = ({
                                               onChange,
                                               documentFilter,
                                               promotedProperties
                                             }) => {

  console.log(documentFilter)

  const keyOptions = useMemo(() => {

    return promotedProperties?.map((p) => ({
      title: p.key,
      id: p.value
    }))

  }, [promotedProperties])

  const onAddFilter = useCallback((newVal: KeyValuePair) => {

    const data = [...(promotedProperties ?? []), newVal]
    onChange(data)
  }, [onChange, promotedProperties])


  const onRemoveFilter = useCallback((newVal: KeyValuePair) => {
    const data = promotedProperties?.filter(x => x.key != newVal.key) ?? []
    onChange(data)
  }, [onChange, promotedProperties])


  return (<div>
    <KeyValueEditor values={documentFilter} title={'Properties'}
                    keyLabel={"Name"} valueLabel={"Value"}
                    onAdd={onAddFilter} onRemove={onRemoveFilter}
                    addLabel={"Add or edit"}
                    keyOptions={keyOptions}
    />
  </div>)
}
export default React.memo(SubscriptionFilter)