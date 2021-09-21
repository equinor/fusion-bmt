import React, { useEffect, useState } from 'react'
import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

import { Barrier, Organization, QuestionTemplate } from '../../api/models'
import { ErrorIcon, TextFieldChangeEvent, Validity } from '../../components/Action/utils'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { getOrganizationOptionsForDropdown, updateValidity } from '../helpers'
import { useEffectNotOnMount } from '../../utils/hooks'
import CancelOrSaveQuestion from './Components/CancelOrSaveQuestion'
import ErrorSavingQuestion from './Components/ErrorSavingQuestion'
import { QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'

interface Props {
    setIsAddingQuestion: (isAddingQuestion: boolean) => void
    barrier: Barrier
}

const CreateQuestionItem = ({
    setIsAddingQuestion,
    barrier,
}: Props) => {
    const [text, setText] = React.useState<string>('')
    const [organization, setOrganization] = React.useState<Organization>(Organization.All)
    const [supportNotes, setSupportNotes] = React.useState<string>('')
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

    const {
        createQuestionTemplate,
        loading: isCreateQuestionTemplateSaving,
        newQuestionTemplate,
        error: createQuestionTemplateSaveError,
    } = useCreateQuestionTemplateMutation()

    const createQuestion = () => {
        const newQuestion: DataToCreateQuestionTemplate = {
            barrier,
            organization,
            text,
            supportNotes,
        }
        createQuestionTemplate(newQuestion)
        setIsAddingQuestion(false)
    }

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'}>
                    <Box display="flex" ml={4} mr={2}>
                        <TextField
                            id={'title'}
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
                            label="Responsible discipline"
                            options={getOrganizationOptionsForDropdown(organization)}
                            onSelect={option => setOrganization(option.key as Organization)}
                        />
                    </Box>
                    <CancelOrSaveQuestion
                        isQuestionTemplateSaving={isCreateQuestionTemplateSaving}
                        setIsInMode={setIsAddingQuestion}
                        onClickSave={createQuestion}
                        textValidity={textValidity}
                    />
                </Box>
            </Box>
            <ErrorSavingQuestion questionTemplateSaveError={createQuestionTemplateSaveError} />
        </Box>
    )
}

export default CreateQuestionItem

export interface DataToCreateQuestionTemplate {
    barrier: Barrier
    organization: Organization
    text: string
    supportNotes: string
}

interface createQuestionTemplateMutationProps {
    createQuestionTemplate: (data: DataToCreateQuestionTemplate) => void
    loading: boolean
    newQuestionTemplate: QuestionTemplate | undefined
    error: ApolloError | undefined
}

const useCreateQuestionTemplateMutation = (): createQuestionTemplateMutationProps => {
    const CREATE_QUESTION_TEMPLATE = gql`
        mutation CreateQuestionTemplate($barrier: Barrier!, $organization: Organization!, $text: String!, $supportNotes: String!) {
            createQuestionTemplate(barrier: $barrier, organization: $organization, text: $text, supportNotes: $supportNotes) {
                ...QuestionTemplateFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
    `

    const [createQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(CREATE_QUESTION_TEMPLATE, {
        update(cache, { data: { createQuestionTemplate } }) {
            cache.modify({
                fields: {
                    questionTemplates(existingQuestionTemplates = []) {
                        const newQuestionTemplateRef = cache.writeFragment({
                            id: createQuestionTemplate.id,
                            data: createQuestionTemplate,
                            fragment: QUESTIONTEMPLATE_FIELDS_FRAGMENT,
                        })
                        return [...existingQuestionTemplates, newQuestionTemplateRef]
                    },
                },
            })
        },
    })

    const createQuestionTemplate = (data: DataToCreateQuestionTemplate) => {
        createQuestionTemplateApolloFunc({
            variables: { ...data },
        })
    }

    return {
        createQuestionTemplate,
        loading,
        newQuestionTemplate: data?.createQuestionTemplate,
        error,
    }
}
