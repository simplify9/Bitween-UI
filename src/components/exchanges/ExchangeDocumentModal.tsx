import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import {apiClient} from "src/client";
import ReactJson from "react-json-view";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {xcode} from 'react-syntax-highlighter/dist/esm/styles/hljs';

function removeInvalidXmlChars(input: string) {
    const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;
    return input.replace(invalidChars, '').replace(/&#xB;/g, '');
}

function isValidXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    return !xmlDoc.getElementsByTagName("parsererror").length;
}
const prettifyXml = (sourceXml: string) => {
    const xmlDoc = new DOMParser().parseFromString((sourceXml), 'application/xml');
    const xsltDoc = new DOMParser().parseFromString([
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">',
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    const resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};
type Props = {
    onClose: () => void
    name: string
    downloadUrl: string
}
const ExchangeDocumentModal: React.FC<Props> = ({onClose, name, downloadUrl}) => {

    const [data, setData] = useState<{ raw: string, data: string | null, type: "json" | "xml" | "text" }>({
        data: null,
        type: "text",
        raw: ""
    });


    const fetchData = async () => {
        const res = await apiClient.getExchangeDocument({documentKey: downloadUrl})
        if (res.data?.data) {
            const resp = res.data.data

            setData({data: resp, type: "text", raw: resp})

            try {
                setData({data: JSON.parse(resp), type: "json", raw: resp})
            } catch {
                try {
                    const xml = removeInvalidXmlChars(resp)
                    console.log(xml)
                    if (!isValidXML(xml))
                        throw new Error("PARSE_ERROR")
                    
                    setData({data: prettifyXml(xml), type: "xml", raw: resp})

                } catch {
                    console.log("RAW")
                    setData({data: resp, type: "text", raw: resp})
                }
            }
        }
    }

    const download = () => {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.raw));
        element.setAttribute('download', name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    useEffect(() => {
        fetchData()
    }, []);
    return <Modal onClose={onClose} className={" min-w-[2000px] "} submitLabel={"Download"} onSubmit={download}
                  title={name}>
        <div className={"px-1 min-w-[2000px] overflow-y-scroll"}>
            <h5 className={"font-semibold underline mb-5 text-lg"}>
                {name}
            </h5>
            <p style={{whiteSpace: "break-spaces"}} className={"flex break-all  "}>

                {
                    data.type === "xml" &&
                    <SyntaxHighlighter wrapLines={true} language="xml" showLineNumbers style={xcode}>
                        {data.data as string}
                    </SyntaxHighlighter>
                }
                {
                    data.type === "text" && <>{data.data}</>
                }
                {
                    data.type === "json" && <ReactJson src={data.data as unknown as object}/>

                }
            </p>
        </div>

    </Modal>
}
export default ExchangeDocumentModal