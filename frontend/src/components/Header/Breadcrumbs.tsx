import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Breadcrumbs } from '@equinor/eds-core-react'
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context'
import { useAppContext } from '../../context/AppContext'

interface BreadCrumb {
    title: string
    href: string
}

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
    const { currentContext, setCurrentContext } = useModuleCurrentContext()
    const basepath = '/apps/bmt'
    const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumb[]>([{ title: 'All projects', href: basepath }])
    const { evaluation } = useAppContext()

    useEffect(() => {
        if (currentContext && currentContext.title) {
            setBreadcrumbs(currentBreadcrumbs => [
                ...currentBreadcrumbs,
                { title: String(currentContext.title), href: `${basepath}/${String(currentContext.id)}` },
            ])
        }
    }, [currentContext])

    useEffect(() => {
        if (evaluation) {
            setBreadcrumbs(currentBreadcrumbs => [
                ...currentBreadcrumbs,
                { title: String(evaluation?.name), href: String(`evaluation/${evaluation?.id}`) },
            ])
        }
    }, [evaluation])

    function handleBreadcrumb(e: any) {
        if (currentContext && !e.target.href.includes(currentContext.id)) {
            setCurrentContext(null)
        }
    }

    return (
        <StyledBreadcrumbs>
            {breadcrumbs.map((breadcrumb, index) => (
                <Breadcrumb
                    key={breadcrumb.href}
                    href={breadcrumbs.length === index + 1 ? undefined : breadcrumb.href}
                    onClick={breadcrumbs.length === index + 1 ? undefined : handleBreadcrumb}
                    as={breadcrumbs.length === index + 1 ? 'span' : 'a'}
                >
                    {breadcrumb.title}
                </Breadcrumb>
            ))}
        </StyledBreadcrumbs>
    )
}

export default BreadCrumbs
