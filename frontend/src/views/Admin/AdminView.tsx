import React from 'react'
import { Divider, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import BarrierSidebar from './BarrierSidebar'
import { Barrier } from '../../api/models'

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
            <BarrierSidebar barrier={selectedBarrier} onBarrierSelected={onBarrierSelected} />
        </>
    )
}

export default AdminView
