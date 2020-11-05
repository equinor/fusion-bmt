
import * as React from 'react';
import { Chip, NavigationStructure, NavigationDrawer } from '@equinor/fusion-components';
import { Barrier } from '../api/models';

const PreparationRoute = () => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<string>(Object.keys(Barrier)[0]);
    const [structure, setStructure] = React.useState<NavigationStructure[]>(
        Object.entries(Barrier).map(([shortName, barrierName]) => {
            return {
                id: barrierName,
                type: 'grouping',
                title: barrierName,
                icon: <>{shortName}</>,
                aside: <Chip title="3/10" />
            }
        })
    );

    return (
        <NavigationDrawer
            id="navigation-drawer-story"
            structure={structure}
            selectedId={selectedBarrier}
            onChangeSelectedId={(selectedItem) => setSelectedBarrier(selectedItem)}
            onChangeStructure={(newStructure) => {
                setStructure(newStructure);
            }}
        />
    );
};

export default PreparationRoute;
