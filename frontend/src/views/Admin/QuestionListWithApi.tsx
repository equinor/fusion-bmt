import { ApolloError, gql, useMutation, useQuery } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'

import { apiErrorMessage } from '../../api/error'
import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../api/models'
import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { useEffectNotOnMount } from '../../utils/hooks'
import AdminQuestionItem from './AdminQuestionItem'

interface Props {
    barrier: Barrier
    projectCategory: string
    projectCategories: ProjectCategory[]
    isInAddCategoryMode: boolean
    setIsInAddCategoryMode: (inMode: boolean) => void
}

const QuestionListWithApi = ({ barrier, projectCategory, projectCategories, isInAddCategoryMode, setIsInAddCategoryMode }: Props) => {
    const { questions, loading, error, refetch: refetchQuestionTemplates } = useQuestionTemplatesQuery()
    const {
        editQuestionTemplate,
        loading: isQuestionTemplateSaving,
        questionTemplate,
        error: questionTemplateSaveError,
    } = useQuestionTemplateMutation()

    useEffectNotOnMount(() => {
        if (!isQuestionTemplateSaving) {
            refetchQuestionTemplates()
        }
    }, [isQuestionTemplateSaving])

    if (loading) {
        return <>Loading...</>
    }

    if (error !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load questions')} onChange={() => {}} />
            </div>
        )
    }

    if (questions === undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Questions are undefined')} onChange={() => {}} />
            </div>
        )
    }

    const projectCategoryQuestions = questions.filter(
        q =>
            q.projectCategories
                .map(pc => {
                    return pc.id
                })
                .includes(projectCategory) || projectCategory === 'all'
    )
    const sortedBarrierQuestions = projectCategoryQuestions.filter(q => q.barrier === barrier).sort((q1, q2) => q1.order - q2.order)

    return (
        <div>
            {sortedBarrierQuestions.map(q => {
                return (
                    <AdminQuestionItem
                        key={q.id}
                        question={q}
                        editQuestionTemplate={editQuestionTemplate}
                        isQuestionTemplateSaving={isQuestionTemplateSaving}
                        questionTemplateSaveError={questionTemplateSaveError}
                        projectCategories={projectCategories}
                        isInAddCategoryMode={isInAddCategoryMode}
                        setIsInAddCategoryMode={setIsInAddCategoryMode}
                    />
                )
            })}
        </div>
    )
}

export default QuestionListWithApi

interface QuestionTemplatesQueryProps {
    loading: boolean
    questions: QuestionTemplate[] | undefined
    error: ApolloError | undefined
    refetch: () => void
}

const useQuestionTemplatesQuery = (): QuestionTemplatesQueryProps => {
    const GET_QUESTIONTEMPLATES = gql`
        query {
            questionTemplates (where: {status: {eq: ${Status.Active}} }) {
                ...QuestionTemplateFields
                ...ProjectCategoryFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
        ${PROJECT_CATEGORY_FIELDS_FRAGMENT}
    `

    const { loading, data, error, refetch } = useQuery<{ questionTemplates: QuestionTemplate[] }>(GET_QUESTIONTEMPLATES)

    return {
        loading,
        questions: data?.questionTemplates,
        error,
        refetch,
    }
}

export interface DataToEditQuestionTemplate {
    questionTemplateId: string
    barrier: Barrier
    organization: Organization
    text: string
    supportNotes: string
    status: Status
}

interface QuestionTemplateMutationProps {
    editQuestionTemplate: (data: DataToEditQuestionTemplate) => void
    loading: boolean
    questionTemplate: QuestionTemplate | undefined
    error: ApolloError | undefined
}

const useQuestionTemplateMutation = (): QuestionTemplateMutationProps => {
    const EDIT_QUESTION_TEMPLATE = gql`
        mutation EditQuestionTemplate(
            $questionTemplateId: String!
            $barrier: Barrier!
            $organization: Organization!
            $text: String!
            $supportNotes: String!
            $status: Status!
        ) {
            editQuestionTemplate(
                questionTemplateId: $questionTemplateId
                barrier: $barrier
                organization: $organization
                text: $text
                supportNotes: $supportNotes
                status: $status
            ) {
                ...QuestionTemplateFields
                ...ProjectCategoryFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
        ${PROJECT_CATEGORY_FIELDS_FRAGMENT}
    `

    const [editQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(EDIT_QUESTION_TEMPLATE)

    const editQuestionTemplate = (data: DataToEditQuestionTemplate) => {
        editQuestionTemplateApolloFunc({
            variables: { ...data },
        })
    }

    return {
        editQuestionTemplate,
        loading,
        questionTemplate: data?.editQuestionTemplate,
        error,
    }
}
