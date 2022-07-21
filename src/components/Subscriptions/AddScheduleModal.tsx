import React, {useCallback, useState} from "react";
import Modal from "src/components/common/Modal";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {OptionType} from "src/types/common";
import {ScheduleView, SubscriptionTypeOptions} from "src/types/subscriptions";
import FormField from "src/components/common/forms/FormField";
import InputBox from "src/components/common/forms/InputBox";
import TextEditor from "src/components/common/forms/TextEditor";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";

type Props = {
  visible: boolean
  onClose: () => void,
  onAdd: (i: ScheduleView) => void

}
const recurrenceOptions: OptionType[] = [
  {
    id: "0",
    title: "Hourly"
  },
  {
    id: "1",
    title: "Daily"
  },
  {
    id: "2",
    title: "Weekly"
  },
  {
    id: "3",
    title: "Monthly"
  },
]
const AddEditScheduleModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {

  const [schedule, setSchedule] = useState<Partial<ScheduleView>>({
    hours: 0,
    days: 0,
    minutes: 0
  })
  const onSubmit = () => {
    onAdd(schedule as ScheduleView)
    onClose()
  }
  const onChangeSubscriptionData = useCallback((key: keyof ScheduleView, value: any) => {
    setSchedule((s) => ({
      ...s,
      [key]: value
    }))
  }, [setSchedule])
  return <Modal key={`${visible}_`} onClose={onClose} submitLabel={"Add"}
                onSubmit={onSubmit}>
    <div>
      <FormField title="Type" className="grow">
        <ChoiceEditor
          value={schedule.recurrence}
          onChange={onChangeSubscriptionData.bind(this, "recurrence")}
          optionTitle={(item: OptionType) => item.title}
          optionValue={(item: OptionType) => item.id}
          options={recurrenceOptions}/>
      </FormField>
    </div>
    <div className={"flex flex-row mt-10 gap-5"}>
      <FormField title="Days" className="grow">
        <TextEditor type={"number"} value={schedule.days}
                    onChange={onChangeSubscriptionData.bind(this, "days")}/>
      </FormField>
      <FormField title="Hours" className="grow">
        <TextEditor type={"number"} value={schedule.hours}
                    onChange={onChangeSubscriptionData.bind(this, "hours")}/>
      </FormField>
      <FormField title="Minutes" className="grow">
        <TextEditor type={"number"} value={schedule.minutes}
                    onChange={onChangeSubscriptionData.bind(this, "minutes")}/>
      </FormField>
    </div>
    <div className={"mt-10"}>
      <CheckBoxEditor label={"Backwards"} checked={schedule.backwards}
                      onChange={onChangeSubscriptionData.bind(this, "backwards")}/>
    </div>
  </Modal>
}

export default AddEditScheduleModal