import {useSelector} from "react-redux";

const LoadingIndicator = () => {
    const isSomeQueryPending = useSelector(state => Object.values(state).flatMap(({
                                                                                      queries,
                                                                                      mutations
                                                                                  }) => Object.values({...(queries ?? {}), ...(mutations ?? {})} || {})).some(({status} = {}) => status === 'pending'));


    return isSomeQueryPending ? <div className="fixed top-0 left-0 w-full h-1 bg-primary-100">
        <div className="h-1 bg-primary-600 animate-move">
            <div className="h-1 w-1/4 bg-primary-200"></div>
        </div>
    </div> : null
}
export default LoadingIndicator