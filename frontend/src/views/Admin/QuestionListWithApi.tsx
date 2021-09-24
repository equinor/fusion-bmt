import { ApolloError, gql, useMutation } from '@apollo/client'
import { TextArea } from '@equinor/fusion-components'

import { apiErrorMessage } from '../../api/error'
import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../api/models'
import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { useEffectNotOnMount } from '../../utils/hooks'
import AdminQuestionItem from './AdminQuestionItem'
import { RefObject } from 'react'

interface Props {
    projectCategories: ProjectCategory[]
    loadingQuestions: boolean
    questions: QuestionTemplate[]
    errorQuestionsQuery: ApolloError | undefined
    refetchQuestionTemplates: () => void
    isInAddCategoryMode: boolean
    setIsInAddCategoryMode: (inMode: boolean) => void
    questionTitleRef: RefObject<HTMLElement>
}

const QuestionListWithApi = ({
    projectCategories,
    isInAddCategoryMode,
    setIsInAddCategoryMode,
    questionTitleRef,
    loadingQuestions,
    questions,
    errorQuestionsQuery,
    refetchQuestionTemplates,
}: Props) => {
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

    if (loadingQuestions) {
        return <>Loading...</>
    }

    if (errorQuestionsQuery !== undefined) {
        return (
            <div>
                <TextArea value={apiErrorMessage('Could not load questions')} onChange={() => {}} />
            </div>
        )
    }

    return (
        <div>
            {questions.map(q => {
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
                        questionTitleRef={questionTitleRef}
                    />
                )
            })}
        </div>
    )
}

export default QuestionListWithApi

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
