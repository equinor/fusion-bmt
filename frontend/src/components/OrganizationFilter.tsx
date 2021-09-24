import { Chip } from '@equinor/eds-core-react'
import { Organization, Question, QuestionTemplate } from '../api/models'
import { organizationToString } from '../utils/EnumToString'

interface Props {
    questions: Question[] | QuestionTemplate[]
    organizationFilter: Organization[]
    onOrganizationFilterToggled: (org: Organization) => void
}

const OrganizationFilter = ({ organizationFilter, onOrganizationFilterToggled, questions }: Props) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', marginTop: '10px' }}>
            {Object.entries(Organization).map(([key, org]) => {
                const questionsWithOrg = questions.map((q: Question | QuestionTemplate) => {return q.organization}).filter(organization => organization === org)
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
