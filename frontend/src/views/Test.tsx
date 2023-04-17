import { RouteComponentProps } from 'react-router-dom'
import { useCurrentContext } from '@equinor/fusion'

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const Test = ({ match }: RouteComponentProps<Params>) => {
    const currentProject = useCurrentContext()
    
    console.log("currentProject in Test.tsx: ", currentProject)
    console.log("match.params.fusionProjectId in Test.tsx: ", match.params.fusionProjectId)

    return (
        <>
            <p>Test page</p>
        </>
    )
}

export default Test