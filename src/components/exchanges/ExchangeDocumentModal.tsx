import Modal from "src/components/common/Modal";
import React, {useEffect, useState} from "react";
import {apiClient} from "src/client";
import ReactJson from "react-json-view";

type Props = {
    onClose: () => void
    name: string
    downloadUrl: string
}
const ExchangeDocumentModal: React.FC<Props> = ({onClose, name, downloadUrl}) => {

    const [data, setData] = useState<{ data: string | object | null, isJson: boolean }>({
        data: null,
        isJson: false
    });


    const fetchData = async () => {
        //https://ams3.digitaloceanspaces.com/kwickbox/temp30/infolinkdocs/35a67843ac3e4b558a3966ca8417d157/input
        const key = downloadUrl?.split("temp30/")?.reverse()?.[0]
        const res = await apiClient.getExchangeDocument({documentKey: `temp30/${key}`})
        console.log(res)
        if (res.data?.data) {
            const resp = res.data.data
            try {

                const fotmated = JSON.parse(resp)

                setData({data: fotmated, isJson: true})

            } catch {
                console.log("catch")
                setData({data: resp, isJson: false})


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
                    data.isJson ? <><ReactJson src={data.data as object}/>
                    </> : <>{data.data}</>
                }
            </p>
        </div>

    </Modal>
}
export default ExchangeDocumentModal