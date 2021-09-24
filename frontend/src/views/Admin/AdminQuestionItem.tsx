import React, { RefObject } from 'react'
import { Divider } from '@equinor/eds-core-react'
import { ProjectCategory, QuestionTemplate } from '../../api/models'
import StaticQuestionItem from './StaticQuestionItem'
import EditableQuestionItem from './EditableQuestionItem'
import { DataToEditQuestionTemplate } from './QuestionListWithApi'
import { useEffectNotOnMount } from '../../utils/hooks'
import { ApolloError } from '@apollo/client'

interface Props {
    question: QuestionTemplate
    isQuestionTemplateSaving: boolean
    editQuestionTemplate: (data: DataToEditQuestionTemplate) => void
    questionTemplateSaveError: ApolloError | undefined
    projectCategories: ProjectCategory[]
    isInAddCategoryMode: boolean
    setIsInAddCategoryMode: (inMode: boolean) => void
    questionTitleRef: RefObject<HTMLElement>
}

const AdminQuestionItem = ({
    question,
    editQuestionTemplate,
    isQuestionTemplateSaving,
    questionTemplateSaveError,
    projectCategories,
    isInAddCategoryMode,
    setIsInAddCategoryMode,
    questionTitleRef,
}: Props) => {
    const [isInEditmode, setIsInEditmode] = React.useState<boolean>(false)

    useEffectNotOnMount(() => {
        if (!isQuestionTemplateSaving && !questionTemplateSaveError) {
            setIsInEditmode(false)
        }
    }, [isQuestionTemplateSaving])

    return (
        <div key={question.id} id={`question-${question.order}`}>
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
                    setIsInAddCategoryMode={setIsInAddCategoryMode}
                    questionTitleRef={questionTitleRef}
                />
            )}
        </div>
    )
}

export default AdminQuestionItem
