import {useParams} from "react-router-dom";


const Component = () => {

    let { id } = useParams();
    return (
        <div>
            Subscription {id}
        </div>
    );
}

export default Component;
