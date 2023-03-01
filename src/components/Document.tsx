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
        let pparr = updateDocumentData.promotedProperties;
        pparr?.push(kv);
        setUpdateDocumentData({...updateDocumentData, promotedProperties: pparr})
    }
    const removePromotedProperty = (kv: KeyValuePair) => {
        let pparr: KeyValuePair[] = [];
        updateDocumentData.promotedProperties?.forEach(pp => {
            if (pp.value != kv.value && pp.key != kv.key) pparr.push(pp);
        });
        setUpdateDocumentData({...updateDocumentData, promotedProperties: pparr})
    }

    return (
        <div className="flex flex-col w-full px-8 py-10 max-w-3xl">
            {
                openModal === "TRAIL" &&
                <TrialsViewModal data={documentTrail} onClose={() => setOpenModal("NONE")}/>
            }
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Documents</div>
                <div className={"flex gap-2"}>
                    <Button onClick={() => {
                        getTrails()
                        setOpenModal("TRAIL")
                    }}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded">
                        Trail
                    </Button>
                    <Authorize roles={["Admin", "Editor"]}>

                        <Button onClick={deleteDocument}
                                className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded">
                            Delete
                        </Button>
                    </Authorize>

                </div>
            </div>
            <div className="  w-full mb-6 group">
                <FormField title="ID" className="grow">
                    <TextEditor disabled={true} value={id}/>
                </FormField>
            </div>
            <div className="  w-full mb-6 group">
                <FormField title="Name" className="grow">
                    <TextEditor disabled={true} value={updateDocumentData?.name}
                                onChange={(t) => setUpdateDocumentData({
                                    ...updateDocumentData,
                                    name: t
                                })}/>
                </FormField>
            </div>
            <div className="  w-full mb-6 group">
                <FormField title="Duplicate Interval" className="grow">
                    <TextEditor value={updateDocumentData?.duplicateInterval} onChange={(t) => setUpdateDocumentData({
                        ...updateDocumentData,
                        duplicateInterval: t
                    })}/>
                </FormField>
            </div>


            <div className="  w-full mb-6 group flex">

                <FormField title="Bus message type name" className="grow">
                    <TextEditor disabled={!updateDocumentData.busEnabled} value={updateDocumentData?.busMessageTypeName}
                                onChange={(t) => setUpdateDocumentData({
                                    ...updateDocumentData,
                                    busMessageTypeName: t
                                })}/>
                </FormField>
            </div>
            <FormField title="Document Format" className={''}>
                <ChoiceEditor
                    value={updateDocumentData?.documentFormat?.toString()}
                    onChange={val => setUpdateDocumentData({
                        ...updateDocumentData,
                        documentFormat: Number(val)
                    })}
                    optionTitle={(item: OptionType) => item.title}
                    optionValue={(item: OptionType) => item.id}
                    options={DocumentFormat}/>
            </FormField>

            <div className="  w-full group flex mt-3">
                <FormField title={""} className="">
                    <CheckBoxEditor label={"Bus Enabled"} checked={updateDocumentData.busEnabled}
                                    onChange={(t) => setUpdateDocumentData({
                                        ...updateDocumentData,
                                        busEnabled: t
                                    })}/>
                </FormField>

            </div>
            <div className="  w-full group flex">
                <FormField title={""} className=" ">
                    <CheckBoxEditor label={"Disregards unfiltered messages"}
                                    checked={updateDocumentData.disregardsUnfilteredMessages}
                                    onChange={(t) => setUpdateDocumentData({
                                        ...updateDocumentData,
                                        disregardsUnfilteredMessages: t
                                    })}/>
                </FormField>

            </div>
            <div className="  w-full mb-6 group flex w-full">

                <KeyValueEditor values={updateDocumentData?.promotedProperties} title={'Promoted Properties'}
                                keyLabel={"Friendly Name"} valueLabel={"Json Path"}
                                onAdd={addPromotedProperty} onRemove={removePromotedProperty}
                                addLabel={"Add New Promoted Property"}
                />


            </div>

            <div className={"flex w-full gap-2"}>
                <Button
                    onClick={() => navigate('/Documents')}
                    className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">Cancel
                </Button>
                <Authorize roles={["Admin", "Editor"]}>

                    <Button
                        onClick={updateDocument}
                        className="text-white bg-blue-800 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  grow sm:w-auto px-5 py-2.5 text-center">Save
                    </Button>
                </Authorize>
            </div>


        </div>
    );
}

export default Component;
