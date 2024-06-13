import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Theme} from "src/types/config";


const initialState: Theme = {
    loginLogo: "/Graphics/s9.png",
    bitweenLogo: "/Graphics/BitweenFull.svg",
    bitweenText: "is all-in-one solution to solving integration with third parties, automating workflows\n" +
        "                                with exchanges coming from all forms of requests, ranging from internal messages to\n" +
        "                                files dumped on a server.",
    linkedinLink: "https://www.google.com/",
    githubLink: "https://github.com/simplify9",
    bitweenIcon: "/Graphics/BitweenIcon.png",
    bitweenHeaderIcon: "/Graphics/BitweenIcon.svg",
    websiteLink: "https://www.simplify9.com/",
    companyName: "Simplify9",
    allRightsReserved: 'All Rights Reserved.',
    copyrightsIcon: '©',
    tabTitle: "Bitween",
    tabIcon: "/favicon.ico",
}
export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.loginLogo = action.payload.loginLogo;
            state.bitweenLogo = action.payload.bitweenLogo;
            state.bitweenText = action.payload.bitweenText;
            state.linkedinLink = action.payload.linkedinLink;
            state.githubLink = action.payload.githubLink;
            state.bitweenIcon = action.payload.bitweenIcon;
            state.bitweenHeaderIcon = action.payload.bitweenHeaderIcon;
            state.websiteLink = action.payload.websiteLink;
            state.companyName = action.payload.companyName;
            state.allRightsReserved = action.payload.allRightsReserved;
            state.copyrightsIcon = action.payload.copyrightsIcon;
            state.tabTitle = action.payload.tabTitle;
            state.tabIcon = action.payload.tabIcon;
        }
    }
});

export const {setTheme} =
    themeSlice.actions;

export default themeSlice.reducer;
