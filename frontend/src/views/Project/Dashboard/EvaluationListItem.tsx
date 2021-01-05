import * as React from 'react'
import { Evaluation, Progression } from '../../../api/models'
import { Link } from 'react-router-dom'
import { Box } from '@material-ui/core'
import { Typography } from '@equinor/eds-core-react'
import ProgressStatusIcon from '../../../components/ProgressStatusIcon'

interface EvaluationListItemProps {
    evaluation: Evaluation
}

const EvaluationListItem = ({evaluation}: EvaluationListItemProps) => {
    const pathname = window.location.pathname
    return (
        <Link to={`${pathname}/evaluation/${evaluation.id}`} style={{textDecoration: "none"}}>
            <Box display="flex" flexDirection="row" alignItems="center" marginY="0.7rem">
                <Box width="200px">
                    <Typography color="primary" variant="body_short" token={{
                        fontSize: '1.2rem',
                    }}>
                        {evaluation.name}
                    </Typography>
                </Box>

                <ProgressStatusIcon progression={evaluation.progression} compareProgression={Progression.Nomination} />
                <ProgressStatusIcon progression={evaluation.progression} compareProgression={Progression.Preparation} />
                <ProgressStatusIcon progression={evaluation.progression} compareProgression={Progression.Alignment} />
                <ProgressStatusIcon progression={evaluation.progression} compareProgression={Progression.Workshop} />
                <ProgressStatusIcon progression={evaluation.progression} compareProgression={Progression.FollowUp} />
            </Box>

        </Link>
    )
}

export default EvaluationListItem
