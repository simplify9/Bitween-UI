import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import {apiClient} from "src/client";
import ReactJson from "react-json-view";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { xcode } from 'react-syntax-highlighter/dist/esm/styles/hljs';
type Props = {
    onClose: () => void
    name: string
    downloadUrl: string
}
const ExchangeDocumentModal: React.FC<Props> = ({onClose, name, downloadUrl}) => {

    const [data, setData] = useState<{ data: string | null, type: "json" | "xml" | "text" }>({
        data: null,
        type: "text"
    });


    const fetchData = async () => {
        const res = await apiClient.getExchangeDocument({documentKey: downloadUrl})
        if (res.data?.data) {
           const resp = res.data.data
            // const resp = "<note>\n" +
            //     "<to>Tove</to>\n" +
            //     "<from>Jani</from>\n" +
            //     "<heading>Reminder</heading>\n" +
            //     "<body>Don't forget me this weekend!</body>\n" +
            //     "</note>"
            try {
                JSON.parse(resp)
                setData({data: resp, type: "json"})

            } catch {
                try {
                    const parser = new DOMParser();
                    parser.parseFromString(resp, 'text/xml');
                    setData({data: resp, type: "xml"})


                } catch {
                    console.log("catch")
                    setData({data: resp, type: "text"})

                }

            }
        }
    }
    useEffect(() => {
        fetchData()
    }, []);
    console.log(data)
    return <Modal onClose={onClose} title={name}>
        <div className={"px-1"}>
            <p style={{whiteSpace: "break-spaces"}} className={"flex break-all  "}>
                {
                    data.type === "xml" && <SyntaxHighlighter language="xml"  showLineNumbers style={xcode}>
                        {data.data as string}
                    </SyntaxHighlighter>
                }
                {
                    data.type === "text" && <>{data.data}</>
                }

                {/*{*/}
                {/*    data.type === "json" && <SyntaxHighlighter language="json" style={darcula}>*/}
                {/*        {data.data as string}*/}
                {/*    </SyntaxHighlighter>*/}
                {/*}*/}
                {
                    data.type === "json" && <ReactJson src={data.data as unknown as object}/>
                
                }
            </p>
        </div>

    </Modal>
}
export default ExchangeDocumentModal