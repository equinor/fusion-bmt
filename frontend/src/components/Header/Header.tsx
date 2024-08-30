import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { Typography } from '@equinor/eds-core-react'
import BreadCrumbs from './Breadcrumbs'
import { useAppContext } from '../../context/AppContext'

const Header = () => {
    const initialHeader = "All projects"
    const { currentProject, currentEvaluation } = useAppContext()
    const [headerTitle, setHeaderTitle] = useState<string>(initialHeader)

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
