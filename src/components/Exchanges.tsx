


interface Props {

}


const Component = (props:Props) => {
    return (
        <div className="flex flex-col w-full px-8 py-4">
            <div className="justify-between w-full flex py-4">
                <div className="text-2xl font-bold tracking-wide text-gray-700">Exchanges</div>
                <button className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded">
                    Create New Exchange
                </button>
            </div>
            <div className="flex w-full shadow-b-2 shadow-gray-200">
                <label className="first:ml-0 ml-4 py-1 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer">Keyword Search</label>
                <label className="first:ml-0 ml-4 py-1 text-sm font-medium shadow-b-2 shadow-teal-500 cursor-default">Find By</label>
                <label className="first:ml-0 ml-4 py-1 text-sm font-light text-gray-400 hover:text-gray-500  hover:shadow-b-2 hover:shadow-gray-400 cursor-pointer">Advanced Search</label>
            </div>
            <form className="flex w-full px-4 py-8">
                <div className="flex flex-wrap items-end -mx-3 mb-2 space-x-4">

                    
                    
                    <label className="mb-6 md:mb-0">
                        <div className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Target Subscription
                        </div>
                        <div className="relative group py-2 px-4 focus-within:shadow-teal-100 focus-within:shadow-md flexborder border-gray-300 border rounded shadow-sm">
                            <input className="appearance-none block grow text-gray-700 focus:outline-none" type="text" placeholder="Select Subscription" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </label>

                    <label className="mb-6 md:mb-0">
                        <div className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Delivery Status
                        </div>
                        <input className="appearance-none block w-full text-gray-700 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:bg-white shadow-sm focus:shadow-teal-100 focus:shadow-md" type="text" placeholder="Select Status" />
                    </label>

                    <label className="mb-6 md:mb-0">
                        <div className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Creation Time Window
                        </div>

                        <div className="relative group py-2 px-4 focus-within:shadow-teal-100 focus-within:shadow-md  border-gray-300 border rounded shadow-sm overflow-visible">
                            <div className="flex flex-nowrap">
                                <div className="text-gray-400 px-2">From</div>
                                <input className="appearance-none block grow text-gray-700 focus:outline-none" type="text" placeholder="DD/MM/YYYY" />
                                <div className="text-gray-400 px-2">To</div>
                                <input className="appearance-none block grow text-gray-700 focus:outline-none" type="text" placeholder="DD/MM/YYYY" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <div className="absolute top-full left-0 right-0" style={{ "minHeight": 80 }}>

                            </div>
                        </div>
                    </label>

                    <button type="submit" className="block appearance-none border bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded shadow-md focus:outline-none">Find</button>
                </div>
            </form>
        </div>
    )
}

export default Component;



