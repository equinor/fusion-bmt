import React from 'react'
import { Barrier } from '../../api/models'
import { NavigationDrawer, NavigationStructure } from '@equinor/fusion-components'
import { barrierToString } from '../../utils/EnumToString'
import Sticky from '../../components/Sticky'

interface Props {
    barrier: Barrier
    onBarrierSelected: (barrier: Barrier) => void
}

const BarrierSidebar = ({ barrier, onBarrierSelected }: Props) => {
    const selectBarrier = (barrier: Barrier) => {
        onBarrierSelected(barrier)
    }

    const structure: NavigationStructure[] = Object.entries(Barrier).map(([_, b]) => {
        return {
            id: b,
            type: 'section',
            title: b + ' ' + barrierToString(b),
            icon: <>{b}</>,
            isActive: barrier === b,
        }
    })

    return (
        <Sticky>
            <NavigationDrawer
                id="navigation-drawer-story"
                structure={structure}
                selectedId={barrier}
                onChangeSelectedId={selectedBarrierId => {
                    selectBarrier(selectedBarrierId as Barrier)
                }}
                onChangeStructure={() => {}}
            />
        </Sticky>
    )
}

export default BarrierSidebar
