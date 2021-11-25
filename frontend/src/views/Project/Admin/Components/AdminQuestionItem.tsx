import React, { RefObject } from 'react'

import { Divider } from '@equinor/eds-core-react'
import { ApolloError, gql, useMutation } from '@apollo/client'

import { Barrier, Organization, ProjectCategory, QuestionTemplate, Status } from '../../../../api/models'
import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../../../api/fragments'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import StaticQuestionItem from './StaticQuestionItem'
import EditableQuestionItem from './EditableQuestionItem'

interface Props {
    question: QuestionTemplate
    projectCategories: ProjectCategory[]
    isInAddCategoryMode: boolean
    isInReorderMode: boolean
    questionTitleRef: RefObject<HTMLElement>
    refetchQuestionTemplates: () => void
    sortedBarrierQuestions: QuestionTemplate[]
    projectCategoryQuestions: QuestionTemplate[]
    setQuestionTemplateToCopy: (original: QuestionTemplate) => void
    setIsAddingQuestion: (val: boolean) => void
    questionToScrollIntoView: string
}

const AdminQuestionItem = ({
    question,
    projectCategories,
    isInAddCategoryMode,
    isInReorderMode,
    questionTitleRef,
    refetchQuestionTemplates,
    sortedBarrierQuestions,
    projectCategoryQuestions,
    setQuestionTemplateToCopy,
    setIsAddingQuestion,
    questionToScrollIntoView,
}: Props) => {
    const [isInEditmode, setIsInEditmode] = React.useState<boolean>(false)

    const { editQuestionTemplate, loading: isQuestionTemplateSaving, error: questionTemplateSaveError } = useQuestionTemplateMutation()

    useEffectNotOnMount(() => {
        if (!isQuestionTemplateSaving) {
            if (!questionTemplateSaveError) {
                setIsInEditmode(false)
            }
            refetchQuestionTemplates()
        }
    }, [isQuestionTemplateSaving])

    return (
        <div key={question.id} id={`question-${question.adminOrder}`}>
            <Divider />
            {isInEditmode ? (
                <EditableQuestionItem
                    question={question}
                    setIsInEditmode={setIsInEditmode}
                    editQuestionTemplate={editQuestionTemplate}
                    isQuestionTemplateSaving={isQuestionTemplateSaving}
                    questionTemplateSaveError={questionTemplateSaveError}
                />
            ) : (
                <StaticQuestionItem
                    question={question}
                    setIsInEditmode={setIsInEditmode}
                    projectCategories={projectCategories}
                    isInAddCategoryMode={isInAddCategoryMode}
                    isInReorderMode={isInReorderMode}
                    questionTitleRef={questionTitleRef}
                    refetchQuestionTemplates={refetchQuestionTemplates}
                    sortedBarrierQuestions={sortedBarrierQuestions}
                    projectCategoryQuestions={projectCategoryQuestions}
                    setQuestionTemplateToCopy={setQuestionTemplateToCopy}
                    setIsAddingQuestion={setIsAddingQuestion}
                    questionToScrollIntoView={questionToScrollIntoView}
                />
            )}
        </div>
    )
}

export default AdminQuestionItem

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
        error,
    }
}
