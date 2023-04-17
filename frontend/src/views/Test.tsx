import { RouteComponentProps } from 'react-router-dom'
import { useCurrentContext, useHistory } from '@equinor/fusion'

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const Test = ({ match }: RouteComponentProps<Params>) => {
    const currentProject = useCurrentContext()
    let history = useHistory();
    
    console.log("currentProject in Test.tsx: ", currentProject)
    console.log("match.params.fusionProjectId in Test.tsx: ", match.params.fusionProjectId)

    if (currentProject !== undefined && currentProject !== null) {
        history.push(`/${currentProject.id}}`)
    }

    return (
        <>
            <p>Reload page</p>
        </>
    )
}

export default Test