import { useLayoutEffect, useRef, useState } from "react";


const useDimensions = () => {
    const ref = useRef<HTMLElement>();
    const [dimensions, setDimensions] = useState({});
    useLayoutEffect(() => {
        if (ref.current) {
            setDimensions(ref.current.getBoundingClientRect().toJSON());
        }
    }, [ref.current]);
    return [ref, dimensions];
}

export default useDimensions;