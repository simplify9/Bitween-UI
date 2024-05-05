import Modal from "src/components/common/Modal";
import React, { useState } from "react";
import { CreateXchangeModel } from "src/types/xchange";
import FormField from "src/components/common/forms/FormField";
import { ChoiceEditor } from "src/components/common/forms/ChoiceEditor";
import SubscriptionSelector from "src/components/Subscriptions/SubscriptionSelector";
import DocumentSelector from "src/components/Documents/DocumentSelector";
import { apiClient } from "src/client";
import Button from "../common/forms/Button";

type Props = {
  onClose: () => void;
};
const CreateExchange: React.FC<Props> = ({ onClose }) => {
  const [createXchange, setCreateXchange] = useState<CreateXchangeModel>({
    documentId: null,
    option: null,
    data: "",
    subscriberId: null,
  });

  const onChange = (val: any, key: keyof CreateXchangeModel) => {
    setCreateXchange((x) => ({ ...x, [key]: val }));
  };

  const onSubmit = async () => {
    if (createXchange.data) {
      const res = await apiClient.createExchange(createXchange);
      if (res.status == 204) {
        onClose();
      }
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result as string;
        onChange(text, "data");
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal onClose={onClose} onSubmit={onSubmit}>
      <div>
        <div className={"flex flex-row gap-5"}>
          <FormField title="Delivery Status">
            <ChoiceEditor
              placeholder="Select Status"
              value={createXchange.option}
              onChange={(status) => onChange(status, "option")}
              optionTitle={(item: any) => item.title}
              optionValue={(item: any) => item.id}
              options={[
                { id: "0", title: "DocumentId" },
                { id: "1", title: "SubscriberId" },
              ]}
            />
          </FormField>
          {createXchange.option === "1" && (
            <FormField title="Subscriber Id">
              <SubscriptionSelector
                value={createXchange.subscriberId}
                onChange={(subscription) =>
                  onChange(subscription, "subscriberId")
                }
              />
            </FormField>
          )}

          {createXchange.option === "0" && (
            <FormField title="Document Id">
              <DocumentSelector
                value={createXchange.documentId}
                onChange={(docId) => onChange(docId, "documentId")}
              />
            </FormField>
          )}
        </div>

        {createXchange.option && (
          <div className={"mt-5"}>
            <textarea
              value={createXchange.data}
              onChange={(e) => onChange(e.target.value, "data")}
              className={"w-full border rounded shadow"}
            />
            <div className="space-y-1 font-[sans-serif] max-w-md mx-auto">
              <span className="text-gray-500">or</span>
              <input
                type="file"
                onChange={onFileChange}
                className="w-full text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-primary-600 file:hover:bg-primary-500 file:transition  file:ease-in-out file:delay-100 file:text-white rounded"
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default CreateExchange;
