import React, { useState } from 'react';
import { Button } from '@equinor/fusion-components';
import AddProject from './AddProject';

import ShowProjects from './ShowProjects';

const GQLButtons = () => {
    const [shouldShowData, setShouldShowData] = useState<Boolean>(false);

    return <>
        <Button onClick={() => {setShouldShowData(!shouldShowData)}}>
            Toggle show projects
        </Button>
        {shouldShowData &&
            <ShowProjects />
        }
        <br />
        <AddProject />
    </>
}

export default GQLButtons;
