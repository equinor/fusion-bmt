import styled from 'styled-components'
import { Breadcrumbs } from '@equinor/eds-core-react'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useAppContext } from '../../context/AppContext'
import { useHistory } from 'react-router-dom'
import { BASEPATH } from '../../utils/constants'

const { Breadcrumb } = Breadcrumbs

const StyledBreadcrumbs = styled(Breadcrumbs)`
    & span {
        line-height: 1.1;
    }
    & li:last-of-type span {
        pointer-events: none;
    }
    & a {
        color: var(--eds_interactive_primary__resting, rgba(0, 112, 121, 1));
        cursor: pointer;
    }
`

const BreadCrumbs = () => {
    const { setCurrentContext } = useModuleCurrentContext()
    const { currentProject, setCurrentProject, currentEvaluation, setCurrentEvaluation } = useAppContext()
    const history = useHistory()

    return (
        <StyledBreadcrumbs>
            <Breadcrumb
                as={!currentProject && !currentEvaluation ? 'span' : 'a'}
                onClick={() => {
                    setCurrentContext(undefined)
                    setCurrentProject(undefined)
                    setCurrentEvaluation(undefined)
                    history.push(BASEPATH)
                }}
            >
                All projects
            </Breadcrumb>
            {currentProject &&
                <Breadcrumb
                    onClick={() => {
                        history.push(BASEPATH + currentProject.fusionProjectId)
                        setCurrentEvaluation(undefined)
                    }}
                    as={!currentEvaluation ? 'span' : 'a'}
                >
                    {String(currentProject.title)}
                </Breadcrumb>
            }
            {currentEvaluation &&
                <Breadcrumb
                    as="span"
                >
                    {currentEvaluation.name}
                </Breadcrumb>
            }
        </StyledBreadcrumbs>
    )
}

export default BreadCrumbs
