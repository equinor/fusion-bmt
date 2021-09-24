import React, { useEffect, useState } from 'react'
import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

import { Organization, QuestionTemplate } from '../../api/models'
import { ErrorIcon, TextFieldChangeEvent, Validity } from '../../components/Action/utils'
import { DataToEditQuestionTemplate } from './QuestionListWithApi'
import { ApolloError } from '@apollo/client'
import { getOrganizationOptionsForDropdown, updateValidity } from '../helpers'
import { useEffectNotOnMount } from '../../utils/hooks'
import CancelOrSaveQuestion from './Components/CancelOrSaveQuestion'
import ErrorSavingQuestion from './Components/ErrorSavingQuestion'

interface Props {
    question: QuestionTemplate
    isQuestionTemplateSaving: boolean
    setIsInEditmode: (inEditmode: boolean) => void
    editQuestionTemplate: (data: DataToEditQuestionTemplate) => void
    questionTemplateSaveError: ApolloError | undefined
}

const EditableQuestionItem = ({
    question,
    setIsInEditmode,
    editQuestionTemplate,
    isQuestionTemplateSaving,
    questionTemplateSaveError,
}: Props) => {
    const [text, setText] = React.useState<string>(question.text)
    const [organization, setOrganization] = React.useState<Organization>(question.organization)
    const [supportNotes, setSupportNotes] = React.useState<string>(question.supportNotes)
    const [textValidity, setTextValidity] = useState<Validity>('default')

    const isTextfieldValid = () => {
        return text.length > 0
    }

    useEffectNotOnMount(() => {
        if (!isTextfieldValid()) {
            setTextValidity('error')
        }
    }, [text])

    useEffect(() => {
        updateValidity(isTextfieldValid(), textValidity, setTextValidity)
    }, [text, textValidity])

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
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'}>
                    <Box display="flex" alignItems={'center'} mt={0.75}>
                        <Box ml={2} mr={1} mt={2}>
                            <Typography variant="h4">{question.order}.</Typography>
                        </Box>
                        <Box display="flex" width={'100%'} mr={2}>
                            <TextField
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
                            />
                        </Box>
                    </Box>
                    <Box ml={3} mt={3} mr={1} mb={10}>
                        <MarkdownEditor
                            onChange={markdown => setSupportNotes(markdown)}
                            menuItems={['strong', 'em', 'bullet_list', 'ordered_list', 'blockquote', 'h1', 'h2', 'h3', 'paragraph']}
                        >
                            {supportNotes}
                        </MarkdownEditor>
                    </Box>
                </Box>
                <Box display="flex" flexDirection={'column'}>
                    <Box flexGrow={1}>
                        <SearchableDropdown
                            label="Organization"
                            options={getOrganizationOptionsForDropdown(organization)}
                            onSelect={option => setOrganization(option.key as Organization)}
                        />
                    </Box>
                    <CancelOrSaveQuestion
                        isQuestionTemplateSaving={isQuestionTemplateSaving}
                        setIsInMode={setIsInEditmode}
                        onClickSave={saveQuestion}
                        questionTitle={text}
                    />
                </Box>
            </Box>
            <ErrorSavingQuestion questionTemplateSaveError={questionTemplateSaveError} />
        </Box>
    )
}

export default EditableQuestionItem
