import {createSlice, PayloadAction} from "@reduxjs/toolkit";

/**
 * Feature flags slice for managing application feature availability
 * 
 * Usage in components:
 * ```
 * import { useTypedSelector } from "src/state/ReduxSotre";
 * 
 * const { workGroupsAvailable, isWorkGroupsChecked } = useTypedSelector(state => state.features);
 * 
 * if (workGroupsAvailable) {
 *   // Show WorkGroups related features
 * }
 * ```
 */

type FeaturesSliceState = {
    workGroupsAvailable: boolean;
    isWorkGroupsChecked: boolean;
}

const initialState: FeaturesSliceState = {
    workGroupsAvailable: false,
    isWorkGroupsChecked: false,
}

export const featuresSlice = createSlice({
    name: "features",
    initialState,
    reducers: {
        setWorkGroupsAvailable: (state, action: PayloadAction<boolean>) => {
            state.workGroupsAvailable = action.payload;
            state.isWorkGroupsChecked = true;
        },
    }
});

export const {setWorkGroupsAvailable} = featuresSlice.actions;

export default featuresSlice.reducer;
