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
  scheduleFrom: Partial<ScheduleView>
  onChangeScheduleFrom: (key: keyof ScheduleView, value: any) => void

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
const AddEditScheduleModal: React.FC<Props> = ({
                                                 visible,
                                                 onClose,
                                                 onAdd,
                                                 scheduleFrom,
                                                 onChangeScheduleFrom
                                               }) => {


  const onSubmit = () => {
    onAdd(scheduleFrom as ScheduleView)
    onClose()
  }

  return <Modal key={`${visible}_`} onClose={onClose} submitLabel={"Add"}
                onSubmit={onSubmit}>
    <div>
      <FormField title="Type" className="grow">
        <ChoiceEditor
          value={scheduleFrom.recurrence}
          onChange={onChangeScheduleFrom.bind(this, "recurrence")}
          optionTitle={(item: OptionType) => item.title}
          optionValue={(item: OptionType) => item.id}
          options={recurrenceOptions}/>
      </FormField>
    </div>
    <div className={"flex flex-row mt-10 gap-5"}>
      <FormField title="Days" className="grow">
        <TextEditor type={"number"} value={scheduleFrom.days}
                    onChange={onChangeScheduleFrom.bind(this, "days")}/>
      </FormField>
      <FormField title="Hours" className="grow">
        <TextEditor type={"number"} value={scheduleFrom.hours}
                    onChange={onChangeScheduleFrom.bind(this, "hours")}/>
      </FormField>
      <FormField title="Minutes" className="grow">
        <TextEditor type={"number"} value={scheduleFrom.minutes}
                    onChange={onChangeScheduleFrom.bind(this, "minutes")}/>
      </FormField>
    </div>
    <div className={"mt-10"}>
      <CheckBoxEditor label={"Backwards"} checked={scheduleFrom.backwards}
                      onChange={onChangeScheduleFrom.bind(this, "backwards")}/>
    </div>
  </Modal>
}

export default AddEditScheduleModal