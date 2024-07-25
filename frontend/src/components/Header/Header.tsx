import { Grid } from '@mui/material'
import { Typography } from '@equinor/eds-core-react'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import BreadCrumbs from './Breadcrumbs'

const Header = () => {
    const { currentContext } = useModuleCurrentContext()

    return (
        <Grid container display="grid" gridTemplateColumns="1fr auto 1fr" alignItems="center">
            <Grid item>
                <BreadCrumbs />
            </Grid>
            <Grid item>
                <Typography variant="h1">{currentContext ? currentContext.title : 'All projects'}</Typography>
            </Grid>
        </Grid>
    )
}

export default Header
