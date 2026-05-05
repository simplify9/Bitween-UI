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

  const routeIsSet =
    (createXchange.option === "1" && !!createXchange.subscriberId) ||
    (createXchange.option === "0" && !!createXchange.documentId);
  const isSubmitReady = routeIsSet && !!createXchange.data?.trim();

  return (
    <Modal
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Create"
      submitDisabled={!isSubmitReady}
    >
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-semibold text-gray-800">Create Exchange</h2>
          <p className="text-xs text-gray-400 mt-0.5">Route a new exchange manually by document or subscription.</p>
        </div>

        {/* Step 1 — routing */}
        <div className="flex flex-col sm:flex-row gap-4">
          <FormField title="Route by" tooltip="Choose whether to route this exchange by document type or by a specific subscription" className="sm:w-48">
            <ChoiceEditor
              placeholder="Select…"
              value={createXchange.option}
              onChange={(option) => {
                setCreateXchange((x) => ({
                  ...x,
                  option,
                  subscriberId: null,
                  documentId: null,
                }));
              }}
              optionTitle={(item: any) => item.title}
              optionValue={(item: any) => item.id}
              options={[
                { id: "0", title: "By Document" },
                { id: "1", title: "By Subscription" },
              ]}
            />
          </FormField>

          {createXchange.option === "1" && (
            <FormField title="Subscription" className="flex-1">
              <SubscriptionSelector
                value={createXchange.subscriberId}
                onChange={(subscription) => onChange(subscription, "subscriberId")}
              />
            </FormField>
          )}

          {createXchange.option === "0" && (
            <FormField title="Document" className="flex-1">
              <DocumentSelector
                value={createXchange.documentId}
                onChange={(docId) => onChange(docId, "documentId")}
              />
            </FormField>
          )}
        </div>

        {/* Step 2 — payload (only shown once routing is set) */}
        {routeIsSet && (
          <div className="flex flex-col gap-2">
            <FormField title="Payload" tooltip="Paste or upload the exchange payload (XML, JSON, etc.)">
              <textarea
                value={createXchange.data}
                placeholder="Paste your payload here (XML, JSON, …)"
                onChange={(e) => onChange(e.target.value, "data")}
                rows={10}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400 resize-y"
              />
            </FormField>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or upload a file</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <input
              type="file"
              onChange={onFileChange}
              className="w-full text-sm text-gray-500 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:rounded file:bg-primary-600 file:hover:bg-primary-500 file:transition file:text-white file:text-sm bg-gray-50 border border-gray-200 rounded-md"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateExchange;
