import { Typography } from '@equinor/eds-core-react'
import { EvaluationWithProjectMasterTitle } from '../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationWithProjectMasterTitle[]
    projectMasterTitles: string[]
}

const TablesAndTitles = ({ evaluationsWithProjectMasterTitle, projectMasterTitles }: Props) => {
    return (
        <>
            {projectMasterTitles.map(title => {
                return (
                    <>
                        <Typography variant={'h2'} style={{ marginBottom: '7px', marginTop: '15px' }}>
                            {title}
                        </Typography>
                        <EvaluationsTable
                            evaluations={evaluationsWithProjectMasterTitle
                                .filter(e => e.projectMasterTitle == title)
                                .map(e => e.evaluation)}
                        />
                    </>
                )
            })}
        </>
    )
}

export default TablesAndTitles
