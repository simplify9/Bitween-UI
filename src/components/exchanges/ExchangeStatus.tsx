

interface Props {
    status: boolean
    onClick: () => void

}

const ExchangeStatus:React.FC<Props> = ({ status,onClick }) => {

    return (
        <>{status != null ?
            status == true ?
            <button onClick={onClick} type="button"
                    className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-3 py-1.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Success</button>
            : <button onClick={onClick} type="button" className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-4 py-1.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Failed</button>
            : <button  type="button" className="text-white bg-yellow-500 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-4 py-1.5 text-center mr-2 mb-2 dark:bg-yellow-400 dark:hover:bg-yellow-700 dark:focus:ring-yellow-900">Running</button>
        }</>
    )
}

export default ExchangeStatus;

