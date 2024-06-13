import { useEffect } from 'react';
import ENV from "src/env";
import {useTypedSelector} from "src/state/ReduxSotre";

const DynamicTitleAndIcon = () => {
    const theme = useTypedSelector(i => i.theme)
    useEffect(() => {
        const title = theme.tabTitle;
        const iconPath = theme.tabIcon;

        document.title = title;

        const existingFavicon = document.querySelector("link[rel*='icon']");
        const newFavicon = document.createElement('link');
        newFavicon.type = 'image/x-icon';
        newFavicon.rel = 'shortcut icon';
        newFavicon.href = iconPath;

        if (existingFavicon) {
            document.head.removeChild(existingFavicon);
        }
        document.head.appendChild(newFavicon);

        return () => {
            document.head.removeChild(newFavicon);
        };
    }, []);

    return null;
};

export default DynamicTitleAndIcon;
