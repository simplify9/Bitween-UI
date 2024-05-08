import ExchangeStatus from "./ExchangeStatus";
import { IXchange } from "src/types/xchange";
import ExchangeProperty from "./ExchangeProperty";
import React, { useState } from "react";
import ExchangeJourney from "src/components/exchanges/ExchangeJourney";
import RetryModal from "src/components/exchanges/RetryModal";
import CheckBoxEditor from "src/components/common/forms/CheckBoxEditor";
import { NavLink } from "react-router-dom";
import { MdLoop } from "react-icons/md";

interface Props {
  data: IXchange[];
  refresh: () => void;
  selectedRowsIds: string[];
  setSelectedRowsIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const getBorderColor = (responseBad, status) => {
  return responseBad
    ? "border-yellow-400"
    : status != null
    ? status
      ? "border-l-green-500"
      : "border-red-400"
    : "";
};
export const ExchangeList: React.FC<Props> = ({
  data,
  refresh,
  setSelectedRowsIds,
  selectedRowsIds,
}) => {
  const [showExceptionFor, setShowExceptionFor] = useState<string | null>(null);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);

  const onClickRow = (id: string) => {
    if (selectedRowsIds.includes(id)) {
      setSelectedRowsIds((arr) => [...arr.filter((i) => i !== id)]);
    } else {
      setSelectedRowsIds((arr) => [...arr, id]);
    }
  };
  return (
    <>
      <table className="appearance-none min-w-full max-w-100 ">
        <thead className="border-y bg-white">
          <tr className={"border-l-8 border-white"}>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500 px-3 py-2 text-left"
            >
              <div className="flex flex-row items-center">
                <CheckBoxEditor
                  onChange={() => {
                    setIsSelectAll(!isSelectAll);
                    data.map((i) => onClickRow(i.id));
                  }}
                  checked={isSelectAll}
                />
                <span className="ml-2">Select All</span>
              </div>
            </th>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500 px-2 py-2  text-left "
            ></th>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500  px-2 py-2 text-left w-[393px] border-r"
            ></th>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500  px-6 py-2 text-left border-r"
            >
              Properties
            </th>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500  px-2 py-2 text-center border-r"
            >
              Status
            </th>
            <th
              scope="col"
              className="text-sm font-medium text-gray-500  px-6 py-2 text-center border-r"
            >
              Options
            </th>
          </tr>
        </thead>
        <tbody className={"max-w-full"}>
          {data.map((i) => (
            <tr
              key={i.id}
              className={`${
                selectedRowsIds.includes(i.id) ? "bg-primary-50" : "bg-white"
              } ${getBorderColor(
                i.responseBad,
                i.status
              )}  border-b border-l-8`}
            >
              <td className="text-sm text-gray-900 font-light whitespace-nowrap ">
                <div className={"flex flex-row items-center  ml-3"}>
                  <CheckBoxEditor
                    onChange={() => onClickRow(i.id)}
                    checked={selectedRowsIds.includes(i.id) || isSelectAll}
                  />
                </div>
              </td>
              <td className="text-sm text-gray-900 font-light px-1 py-2 min-w-[153px] max-w-[240px]">
                <div className={"flex flex-col gap-2 "}>
                  <NavLink to={`/documents/${i.documentId}`}>
                    <div
                      title={i.documentName}
                      className={
                        "flex items-center gap-x-2  cursor-pointer border rounded-[12px] px-1 py-2"
                      }
                    >
                      <img src={"/Icons/document.svg"} className={"h-5"} />
                      <p>{i.documentName}</p>
                    </div>
                  </NavLink>
                  {i.subscriptionId && (
                    <NavLink to={`/subscriptions/${i.subscriptionId}`}>
                      <div
                        title={i.subscriptionName}
                        className={
                          "flex items-center gap-x-2  cursor-pointer border rounded-[12px] px-1 py-2 overflow-hidden"
                        }
                      >
                        <img
                          src={"/Icons/subscription.svg"}
                          className={"h-5 z-10"}
                        />

                        <p className="truncate ">
                          {i.subscriptionName +
                            i.subscriptionName +
                            i.subscriptionName}
                        </p>
                      </div>
                    </NavLink>
                  )}
                </div>
              </td>

              <td className="text-sm text-gray-900 font-light  py-2 whitespace-nowrap">
                <ExchangeJourney
                  hasSubscription={!!i.subscriptionId}
                  finishedOn={i.finishedOn}
                  startedOn={i.startedOn}
                  status={i.status}
                  failed={Boolean(i.exception)}
                  outputBad={i.outputBad}
                  mapperId={i.mapperId}
                  responseBad={i.responseBad}
                  outputKey={i.outputKey}
                  inputKey={i.inputKey}
                  responseKey={i.responseKey}
                />
              </td>

              <td className="  ">
                <div className={"flex gap-2 px-1 py-2  flex-wrap  "}>
                  <ExchangeProperty
                    className={"text-xs bg-primary-400 text-white font-thin"}
                    label={"Id"}
                    value={i.id}
                  />

                  <ExchangeProperty
                    className={"text-xs bg-primary-400 text-white font-thin"}
                    label={"CId"}
                    value={i.correlationId}
                  />
                  {i.retryFor && (
                    <ExchangeProperty
                      className={"text-xs bg-yellow-100 font-thin"}
                      label={"Retry for"}
                      value={i.retryFor}
                    />
                  )}

                  {i.promotedProperties &&
                    Object.keys(i.promotedProperties)?.map((k: string) => (
                      <ExchangeProperty
                        className={"text-xs bg-green-100"}
                        key={k}
                        label={k}
                        value={i.promotedProperties[k]}
                      />
                    ))}
                </div>
              </td>

              <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap z-10">
                <ExchangeStatus
                  status={i.status!}
                  responseBad={i.responseBad}
                />
              </td>
              <td className="text-sm text-gray-900 font-light px-2 py-2 whitespace-nowrap z-10">
                <div className={"flex items-center justify-center"}>
                  <MdLoop
                    className={"text-gray-500"}
                    size={24}
                    onClick={() => setShowExceptionFor(i.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showExceptionFor && (
        <RetryModal
          xid={showExceptionFor}
          exception={data.find((i) => i.id == showExceptionFor)?.exception}
          onClose={() => setShowExceptionFor(null)}
        />
      )}
    </>
  );
};
