import React from 'react'
import { Chip } from '@equinor/eds-core-react'
import { Organization, Question } from '../api/models'
import { organizationToString } from '../utils/EnumToString'

interface Props {
    questions: Question[]
    organizationFilter: Organization[]
    onOrganizationFilterToggled: (org: Organization) => void
}

const OrganizationFilter = ({ organizationFilter, onOrganizationFilterToggled, questions }: Props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px' }}>
            {Object.entries(Organization).map(([key, org]) => {
                const questionsWithOrg = questions.filter(q => q.organization === org)
                const numQuestionsWithOrg = questionsWithOrg.length

                return (
                    <Chip
                        key={key}
                        variant={organizationFilter.includes(org) ? 'active' : 'default'}
                        style={{ fontSize: '12px', cursor: 'pointer', marginRight: '10px' }}
                        onClick={() => onOrganizationFilterToggled(org)}
                    >
                        {`${organizationToString(org)} (${numQuestionsWithOrg})`}
                    </Chip>
                )
            })}
        </div>
    )
}

export default OrganizationFilter
