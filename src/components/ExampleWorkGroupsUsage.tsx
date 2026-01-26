/**
 * Example: How to use the WorkGroups availability feature flag
 * 
 * This file demonstrates how to access and use the workGroupsAvailable flag
 * in any component throughout the application.
 */

import React from 'react';
import { useTypedSelector } from 'src/state/ReduxSotre';

export const ExampleComponent = () => {
    // Access the feature flags from Redux store
    const { workGroupsAvailable, isWorkGroupsChecked } = useTypedSelector(
        state => state.features
    );

    // Wait for the check to complete before rendering
    if (!isWorkGroupsChecked) {
        return <div>Checking features...</div>;
    }

    return (
        <div>
            {workGroupsAvailable ? (
                <div>
                    {/* Show WorkGroups related features */}
                    <h2>WorkGroups Feature</h2>
                    <p>WorkGroups API is available!</p>
                    {/* Add your WorkGroups components here */}
                </div>
            ) : (
                <div>
                    {/* Alternative UI when WorkGroups is not available */}
                    <p>WorkGroups feature is not available</p>
                </div>
            )}
        </div>
    );
};
