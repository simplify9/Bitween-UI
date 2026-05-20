import {useNavigate, useParams} from "react-router-dom";
import Button from "./common/forms/Button";
import FormField from "./common/forms/FormField";
import TextEditor from "./common/forms/TextEditor";
import {useEffect, useState} from "react";
import {apiClient} from "../client";
import {DocumentFormat, IDocument, UpdateDocument} from "../types/document";
import {KeyValuePair, OptionType} from "../types/common";
import CheckBoxEditor from "./common/forms/CheckBoxEditor";
import KeyValueEditor from "./common/forms/KeyValueEditor";
import {ChoiceEditor} from "src/components/common/forms/ChoiceEditor";
import {TrailBaseModel} from "src/types/trail";
import TrialsViewModal from "src/components/common/trails/trialsViewModal";
import Authorize from "src/components/common/authorize/authorize";

const JSON_PATH_RE = /^(\$[\w$.[\]*?@:,()'"\\-]*|[a-zA-Z_][a-zA-Z0-9_.]*)$/;
const XML_PATH_RE = /^(\/[\w$.[\]*?@:,()'"\\/-]*|[a-zA-Z_][a-zA-Z0-9_/[\]@.:*-]*)$/;

function validatePromotedProperties(
    props: KeyValuePair[] | undefined,
    documentFormat: string | undefined
): string | null {
    if (!props || props.length === 0) return null;

    const seen = new Set<string>();
    for (const pp of props) {
        if (!pp.key || pp.key.trim() === '')
            return 'Promoted property key cannot be empty.';
        if (!pp.value || pp.value.trim() === '')
            return `Promoted property "${pp.key}" must have a non-empty path value.`;

        const trimmed = pp.value.trim();
        if (documentFormat === "Json" && !JSON_PATH_RE.test(trimmed))
            return `"${pp.key}": invalid JSON path "${pp.value}". Use JSONPath (e.g. $.field.sub) or dot-notation.`;
        if (documentFormat === "Xml" && !XML_PATH_RE.test(trimmed))
            return `"${pp.key}": invalid XPath "${pp.value}". Use XPath (e.g. /root/element).`;

        const lower = pp.key.toLowerCase();
        if (seen.has(lower))
            return `Promoted property key "${pp.key}" is duplicated.`;
        seen.add(lower);
    }
    return null;
}

const Component = () => {
    let navigate = useNavigate();
    let {id} = useParams();
    const [document, setDocument] = useState<IDocument>();
    const [updateDocumentData, setUpdateDocumentData] = useState<UpdateDocument>({id: id});
    const [documentTrail, setDocumentTrail] = useState<TrailBaseModel[]>([]);
    const [openModal, setOpenModal] = useState<"NONE" | "TRAIL">("NONE");


    useEffect(() => {
        if (id) {
            refreshDocument(id).then();
        }

    }, [id]);

    useEffect(() => {
        setUpdateDocumentData({
            id: id,
            name: document?.name,
            duplicateInterval: document?.duplicateInterval,
            busEnabled: document?.busEnabled,
            busMessageTypeName: document?.busMessageTypeName,
            promotedProperties: document?.promotedProperties,
            documentFormat: document?.documentFormat,
            disregardsUnfilteredMessages: document?.disregardsUnfilteredMessages
        })
    }, [document, id])

    const refreshDocument = async (id: string) => {
        let res = await apiClient.findDocument(id);
        if (res.succeeded) setDocument(res.data);
        await getTrails()
    }

    const updateDocument = async () => {
        let res = await apiClient.updateDocument(id!, updateDocumentData);
        if (res.succeeded) await refreshDocument(id!);
    }
    const deleteDocument = async () => {
        let res = await apiClient.deleteDocument(id!);
        if (res.succeeded) navigate('/documents')
    }
    const getTrails = async () => {
        let res = await apiClient.findDocumentTrail(id!);
        if (res.succeeded) setDocumentTrail(res.data.result)
    }
    const addPromotedProperty = (kv: KeyValuePair) => {
        const pparr = [...(updateDocumentData.promotedProperties ?? []), kv];
        setUpdateDocumentData({...updateDocumentData, promotedProperties: pparr});
    }
    const removePromotedProperty = (kv: KeyValuePair) => {
        let pparr: KeyValuePair[] = [];
        updateDocumentData.promotedProperties?.forEach(pp => {
            if (pp.value != kv.value && pp.key != kv.key) pparr.push(pp);
        });
        setUpdateDocumentData({...updateDocumentData, promotedProperties: pparr})
    }

    return (
        <div className="flex flex-col w-full md:max-w-[600px]">
            {
                openModal === "TRAIL" &&
                <TrialsViewModal data={documentTrail} onClose={() => setOpenModal("NONE")}/>
            }
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">{document?.name}</div>
                <div className={"flex gap-2"}>
                    <Button onClick={() => {
                        getTrails()
                        setOpenModal("TRAIL")
                    }}
                    >
                        Trail
                    </Button>
                    <Authorize roles={["Admin", "Member"]}>

                        <Button onClick={deleteDocument}
                        >
                            Delete
                        </Button>
                    </Authorize>

                </div>
            </div>

            {
                updateDocumentData?.busEnabled && <div className="  w-full mb-6  flex">

                    <FormField title="Bus message type name" className="grow">
                        <TextEditor disabled={!updateDocumentData.busEnabled} value={updateDocumentData?.busMessageTypeName}
                                    onChange={(t) => setUpdateDocumentData({
                                        ...updateDocumentData,
                                        busMessageTypeName: t
                                    })}/>
                    </FormField>
                </div>
            }


            <div className={"shadow-lg  bg-white  rounded-xl p-2 mb-5"}>
                <FormField title="Document Format" className={''}>
                    <ChoiceEditor
                        value={updateDocumentData?.documentFormat}
                        onChange={val => setUpdateDocumentData({
                            ...updateDocumentData,
                            documentFormat: val
                        })}
                        optionTitle={(item: OptionType) => item.title}
                        optionValue={(item: OptionType) => item.id}
                        options={DocumentFormat}/>
                </FormField>
                <div className="  w-full  flex mt-3">
                    <FormField title={""} className="">
                        <CheckBoxEditor label={"Bus Enabled"} checked={updateDocumentData.busEnabled}
                                        onChange={(t) => setUpdateDocumentData({
                                            ...updateDocumentData,
                                            busEnabled: t
                                        })}/>
                    </FormField>

                </div>
                <div className="  w-full  flex">
                    <FormField title={""} className=" ">
                        <CheckBoxEditor label={"Disregards unfiltered messages"}
                                        checked={updateDocumentData.disregardsUnfilteredMessages}
                                        onChange={(t) => setUpdateDocumentData({
                                            ...updateDocumentData,
                                            disregardsUnfilteredMessages: t
                                        })}/>
                    </FormField>

                </div>
            </div>

            <div className={"shadow-lg  bg-white  rounded-xl p-2 mb-5"}>
                <KeyValueEditor
                    values={updateDocumentData?.promotedProperties}
                    title={'Promoted Properties'}
                    keyLabel={"Friendly Name"}
                    valueLabel={
                        updateDocumentData.documentFormat === "Json" ? 'JSON Path'
                        : updateDocumentData.documentFormat === "Xml" ? 'XML Path'
                        : 'Path'
                    }
                    valuePlaceholder={
                        updateDocumentData.documentFormat === "Json" ? 'e.g. $.customer.name or customer.name'
                        : updateDocumentData.documentFormat === "Xml" ? 'e.g. /root/element or /root/@attr'
                        : 'Enter path…'
                    }
                    onAdd={addPromotedProperty}
                    onRemove={removePromotedProperty}
                    addLabel={"Add New Promoted Property"}
                    validate={(kv) => validatePromotedProperties(
                        [...(updateDocumentData.promotedProperties ?? []), kv],
                        updateDocumentData.documentFormat
                    )}
                />


            </div>

            <div className={"flex w-full gap-2 flex flex-row-reverse"}>

                <Authorize roles={["Admin", "Member"]}>

                    <Button
                        onClick={updateDocument}
                    >Save
                    </Button>
                </Authorize>
                <Button
                    variant={"secondary"}
                    onClick={() => navigate('/Documents')}
                >
                    Cancel
                </Button>
            </div>

        </div>
    );
}

export default Component;
