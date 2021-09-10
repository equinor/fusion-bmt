import React from 'react'
import { MoreIcon, AddIcon } from '@equinor/fusion-components'
import { Divider, Typography } from '@equinor/eds-core-react'
import { tokens } from '@equinor/eds-tokens'
import { Box } from '@material-ui/core'

import BarrierSidebar from './BarrierSidebar'
import { Barrier } from '../../api/models'
import QuestionListWithApi from './QuestionListWithApi'
import { barrierToString } from '../../utils/EnumToString'

interface Props {}

const AdminView = ({}: Props) => {
    const [selectedBarrier, setSelectedBarrier] = React.useState<Barrier>(Barrier.Gm)
    const headerRef = React.useRef<HTMLElement>(null)

    const onBarrierSelected = (barrier: Barrier) => {
        setSelectedBarrier(barrier)

        if (headerRef !== null && headerRef.current) {
            headerRef.current.scrollIntoView()
        }
    }

    return (
        <>
            <Box m={2}>
                <Typography variant="h2">Project configuration: Questionnaire</Typography>
            </Box>
            <Divider />
            <Box display="flex" height={1}>
                <Box>
                    <BarrierSidebar barrier={selectedBarrier} onBarrierSelected={onBarrierSelected} />
                </Box>
                <Box p="20px" width="1">
                    <Box display="flex" flexDirection="row">
                        <Box flexGrow={1} m={1}>
                            <Typography variant="h3" ref={headerRef}>
                                {barrierToString(selectedBarrier)}
                            </Typography>
                        </Box>
                        <Box mr={2} mt={2.5}>
                            <AddIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
                        </Box>
                        <Box mt={2.5}>
                            <MoreIcon cursor="pointer" color={tokens.colors.interactive.primary__resting.rgba} />
                        </Box>
                    </Box>
                    <QuestionListWithApi barrier={selectedBarrier} />
                </Box>
            </Box>
        </>
    )
}

export default AdminView
