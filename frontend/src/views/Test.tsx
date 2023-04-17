import { RouteComponentProps, useParams } from 'react-router-dom'
import { useCurrentContext, useHistory } from '@equinor/fusion'
import { useEffect } from 'react'

interface Params {
    fusionProjectId: string
    evaluationId: string
}

const Test = ({ match }: RouteComponentProps<Params>) => {
    const currentProject = useCurrentContext()
    let history = useHistory();

    const { fusionContextId } = useParams<Record<string, string | undefined>>()
    
    console.log("currentProject in Test.tsx: ", currentProject)
    console.log("match.params.fusionProjectId in Test.tsx: ", match.params.fusionProjectId)
    console.log("fusionContextId in Test.tsx: ", fusionContextId)

    // if (currentProject !== undefined && currentProject !== null) {
    //     history.push(`/${currentProject.id}}`)
    // }

    useEffect(() => {
        history.listen((location) => {
            console.log(`You changed the page to: ${location.pathname}`)
        })
    }, [history])

    useEffect(() => {
        if (match?.params?.fusionProjectId !== undefined && match?.params?.fusionProjectId !== null) {
            history.push(`/${match.params.fusionProjectId}}`)
        }
    }, [match.params.fusionProjectId, match.params, match])

    return (
        <>
            <p>Reload page</p>
        </>
    )
}

export default Test