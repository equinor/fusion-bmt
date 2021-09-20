import React from 'react'
import { Button, Divider, Icon, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

import BarrierSidebar from './BarrierSidebar'
import { Barrier } from '../../api/models'
import QuestionListWithApi from './QuestionListWithApi'
import { barrierToString } from '../../utils/EnumToString'
import { add, more_vertical } from '@equinor/eds-icons'

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
                        <Box mt={2.5}>
                            <Button variant="ghost" color="primary">
                                <Icon data={add}></Icon>
                            </Button>
                        </Box>
                        <Box mt={2.5}>
                            <Button variant="ghost" color="primary">
                                <Icon data={more_vertical}></Icon>
                            </Button>
                        </Box>
                    </Box>
                    <QuestionListWithApi barrier={selectedBarrier} />
                </Box>
            </Box>
        </>
    )
}

export default AdminView
