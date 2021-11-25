import { Typography } from '@equinor/eds-core-react'
import { EvaluationsByProjectMaster } from '../../../../utils/hooks'
import EvaluationsTable from './EvaluationsTable'

interface Props {
    evaluationsWithProjectMasterTitle: EvaluationsByProjectMaster
}

const TablesAndTitles = ({ evaluationsWithProjectMasterTitle }: Props) => {
    return (
        <>
            {Object.entries(evaluationsWithProjectMasterTitle).map(([projectMasterTitle, evaluations], index) => {
                return (
                    <div key={index}>
                        <Typography variant={'h2'} style={{ marginBottom: '7px', marginTop: '15px' }}>
                            {projectMasterTitle}
                        </Typography>
                        <EvaluationsTable evaluations={evaluations} />
                    </div>
                )
            })}
        </>
    )
}

export default TablesAndTitles
