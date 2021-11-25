import React, { useState } from 'react'

import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'
import { ApolloError, gql, useMutation } from '@apollo/client'

import { Barrier, Organization, QuestionTemplate, Status } from '../../../../api/models'
import { ErrorIcon, TextFieldChangeEvent } from '../../../../components/Action/utils'
import { getOrganizationOptionsForDropdown } from '../../../helpers'
import { useEffectNotOnMount, useValidityCheck } from '../../../../utils/hooks'
import CancelAndSaveButton from '../../../../components/CancelAndSaveButton'
import { PROJECT_CATEGORY_FIELDS_FRAGMENT, QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../../../api/fragments'
import ErrorBanner from '../../../../components/ErrorBanner'
import { genericErrorMessage } from '../../../../utils/Variables'

interface Props {
    question: QuestionTemplate
    setIsInEditmode: (inEditmode: boolean) => void
    refetchQuestionTemplates: () => void
}

const EditableQuestionItem = ({ question, setIsInEditmode, refetchQuestionTemplates }: Props) => {
    const { editQuestionTemplate, loading: isQuestionTemplateSaving, error: questionTemplateSaveError } = useQuestionTemplateMutation()

    const [text, setText] = React.useState<string>(question.text)
    const [organization, setOrganization] = React.useState<Organization>(question.organization)
    const [supportNotes, setSupportNotes] = React.useState<string>(question.supportNotes)

    const [showCreateErrorMessage, setShowCreateErrorMessage] = useState<boolean>(false)

    const isTextfieldValid = () => {
        return text.length > 0
    }

    const { valueValidity: textValidity } = useValidityCheck<string>(text, isTextfieldValid)

    useEffectNotOnMount(() => {
        if (!isQuestionTemplateSaving && questionTemplateSaveError === undefined) {
            setIsInEditmode(false)
            refetchQuestionTemplates()
        }
    }, [isQuestionTemplateSaving])

    useEffectNotOnMount(() => {
        if (questionTemplateSaveError !== undefined) {
            setShowCreateErrorMessage(true)
        }
    }, [questionTemplateSaveError])

    const saveQuestion = () => {
        const newQuestion: DataToEditQuestionTemplate = {
            questionTemplateId: question.id,
            barrier: question.barrier,
            organization,
            text,
            supportNotes,
            status: question.status,
        }
        editQuestionTemplate(newQuestion)
    }

    return (
        <Box display="flex" flexDirection="column">
            {showCreateErrorMessage && (
                <ErrorBanner message={'Unable to save question. ' + genericErrorMessage} onClose={() => setShowCreateErrorMessage(false)} />
            )}
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'}>
                    <Box display="flex" alignItems={'center'} mt={0.75}>
                        <Box ml={2} mr={1} mt={2}>
                            <Typography variant="h4">{question.adminOrder}.</Typography>
                        </Box>
                        <Box display="flex" width={'100%'} mr={2}>
                            <TextField
                                data-testid={'question-title-' + question.adminOrder}
                                id={question.id}
                                value={text}
                                autoFocus={true}
                                label="Question"
                                onChange={(event: TextFieldChangeEvent) => {
                                    setText(event.target.value)
                                }}
                                variant={textValidity}
                                helperText={textValidity === 'error' ? 'required' : ''}
                                helperIcon={textValidity === 'error' ? ErrorIcon : <></>}
                                multiline
                            />
                        </Box>
                    </Box>
                    <Box ml={3} mt={3} mr={1} mb={10}>
                        <MarkdownEditor
                            data-testid="markdown-editor"
                            onChange={markdown => setSupportNotes(markdown)}
                            menuItems={['strong', 'em', 'bullet_list', 'ordered_list', 'blockquote', 'h1', 'h2', 'h3', 'paragraph']}
                        >
                            {supportNotes === '' ? ' ' : supportNotes}
                        </MarkdownEditor>
                    </Box>
                </Box>
                <Box display="flex" flexDirection={'column'}>
                    <Box flexGrow={1} mt={3}>
                        <SearchableDropdown
                            label="Organization"
                            options={getOrganizationOptionsForDropdown(organization)}
                            onSelect={option => setOrganization(option.key as Organization)}
                        />
                    </Box>
                    <CancelAndSaveButton
                        onClickCancel={() => setIsInEditmode(false)}
                        onClickSave={saveQuestion}
                        isSaving={isQuestionTemplateSaving}
                        cancelButtonTestId="cancel-edit-question"
                        saveButtonTestId="save-question-button"
                        disableCancelButton={isQuestionTemplateSaving}
                        disableSaveButton={isQuestionTemplateSaving || !isTextfieldValid()}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default EditableQuestionItem

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
