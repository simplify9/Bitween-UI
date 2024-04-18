import { useEffect } from 'react';
import ENV from "src/env";

const DynamicTitleAndIcon = () => {
    useEffect(() => {
        const title = ENV.THEME.TAB_TITLE;
        const iconPath = ENV.THEME.TAB_ICON;

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
