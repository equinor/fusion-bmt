import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { Typography } from '@equinor/eds-core-react'
import BreadCrumbs from './Breadcrumbs'
import { useAppContext } from '../../context/AppContext'
import { useHistory } from 'react-router-dom'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'

const Header = () => {
    const initialHeader = "All projects"
    const {currentContext} = useModuleCurrentContext()
    const { currentProject, currentEvaluation, setCurrentEvaluation, setCurrentProject } = useAppContext()
    const [headerTitle, setHeaderTitle] = useState<string>(initialHeader)
    const history = useHistory()

    useEffect(() => {
        if (!currentContext) {
            setCurrentProject(undefined)
            setCurrentEvaluation(undefined)
            history.push("/apps/bmt/")
        }
    }, [currentContext])

    useEffect(() => {
        if (currentProject && headerTitle !== String(currentProject.title) && !currentEvaluation) {
            setHeaderTitle(String(currentProject.title))
        }
        if (currentEvaluation && headerTitle !== currentEvaluation.name) {
            setHeaderTitle(currentEvaluation.name)
        }
        if (!currentProject && !currentEvaluation && headerTitle !== initialHeader) {
            setHeaderTitle(initialHeader)
        }
    }, [currentProject, currentEvaluation])

    return (
        <Grid container display="grid" gridTemplateColumns="1fr auto 1fr" alignItems="center">
            <Grid item>
                <BreadCrumbs />
            </Grid>
            <Grid item>
                <Typography variant="h1">{headerTitle}</Typography>
            </Grid>
        </Grid>
    )
}

export default Header
