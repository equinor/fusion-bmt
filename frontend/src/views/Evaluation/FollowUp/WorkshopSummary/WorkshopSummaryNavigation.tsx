import React from 'react'

import { Box } from '@material-ui/core'
import { Icon } from '@equinor/eds-core-react'

import { NavigationDrawer, NavigationStructure } from '@equinor/fusion-components'
import { list } from '@equinor/eds-icons'

const bowtie = {
    name: 'bowtie',
    prefix: 'eds',
    height: '24',
    width: '24',
    svgPathData: `m 2 6 v 12 l 10 -5 l 10 5 v -12 l -10 5 l -10 -5 z m 1 2 v 8 l 8 -4 l -8 -4 z M 21 8 v 8 l -8 -4 l 8 -4 z`,
}

export type ViewOption = 'bowtie' | 'list'

interface Props {
    selectedViewOption: ViewOption
    onViewOptionSelected: (option: ViewOption) => void
}

const WorkshopSummaryNavigation = ({ selectedViewOption, onViewOptionSelected }: Props) => {
    const structure: NavigationStructure[] = [
        {
            id: 'bowtie',
            type: 'grouping',
            title: 'Bowtie model',
            isActive: selectedViewOption === 'bowtie',
            icon: <Icon data={bowtie} />,
        },
        {
            id: 'list',
            type: 'grouping',
            title: 'List view',
            isActive: selectedViewOption === 'list',
            icon: <Icon data={list} />,
        },
    ]

    return (
        <Box>
            <NavigationDrawer
                id="navigation-drawer-story"
                structure={structure}
                selectedId={selectedViewOption}
                onChangeSelectedId={selectedId => {
                    onViewOptionSelected(selectedId as ViewOption)
                }}
                onChangeStructure={() => {}}
            />
        </Box>
    )
}

export default WorkshopSummaryNavigation
