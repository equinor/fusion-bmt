import React, { RefObject } from 'react'
import { Divider } from '@equinor/eds-core-react'

import { ProjectCategory, QuestionTemplate } from '../../../../api/models'
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

    return (
        <div key={question.id} id={`question-${question.adminOrder}`}>
            <Divider />
            {isInEditmode ? (
                <EditableQuestionItem
                    question={question}
                    setIsInEditmode={setIsInEditmode}
                    refetchQuestionTemplates={refetchQuestionTemplates}
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
