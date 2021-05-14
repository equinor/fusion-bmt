import { AuthContainer, createFusionContext, FusionContext, ServiceResolver } from '@equinor/fusion'
import { render } from '@testing-library/react'
import React from 'react'
import { HashRouter } from 'react-router-dom'

const serviceResolver: ServiceResolver = {
    getContextBaseUrl: () => 'https://pro-s-context-ci.azurewebsites.net',
    getDataProxyBaseUrl: () => 'https://pro-s-dataproxy-ci.azurewebsites.net',
    getFusionBaseUrl: () => 'https://pro-s-portal-ci.azurewebsites.net',
    getMeetingsBaseUrl: () => 'https://pro-s-meeting-v2-ci.azurewebsites.net',
    getOrgBaseUrl: () => 'https://pro-s-org-ci.azurewebsites.net',
    getPowerBiBaseUrl: () => 'https://pro-s-powerbi-ci.azurewebsites.net',
    getProjectsBaseUrl: () => 'https://pro-s-projects-ci.azurewebsites.net',
    getTasksBaseUrl: () => 'https://pro-s-tasks-ci.azurewebsites.net',
    getPeopleBaseUrl: () => 'https://pro-s-people-ci.azurewebsites.net',
    getReportsBaseUrl: () => 'https://pro-s-reports-ci.azurewebsites.net',
    getPowerBiApiBaseUrl: () => 'https://api.powerbi.com/v1.0/myorg',
    getNotificationBaseUrl: () => 'https://pro-s-notification-ci.azurewebsites.net',
    getInfoUrl: () => 'https://pro-s-info-app-ci.azurewebsites.net',
    getFusionTasksBaseUrl: () => 'https://pro-s-tasks-ci.azurewebsites.net',
    getBookmarksBaseUrl: () => 'https://pro-s-bookmarks-ci.azurewebsites.net',
}

export const FusionTestWrapper: React.FC = ({ children }) => {
    const overlay = React.useRef<HTMLElement | null>(null)
    const root = React.useRef<HTMLElement | null>(null)
    const headerContent = React.useRef<HTMLElement | null>(null)
    const fusionContext = createFusionContext(new AuthContainer(), serviceResolver, {
        overlay,
        root,
        headerContent,
    })
    return (
        <FusionContext.Provider value={fusionContext}>
            <HashRouter>{children}</HashRouter>
        </FusionContext.Provider>
    )
}

export const renderWithContext = (children: any) => render(<FusionTestWrapper>{children}</FusionTestWrapper>)
