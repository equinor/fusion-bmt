import React, { RefObject } from 'react'
import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

import { Barrier, Organization } from '../../api/models'
import { ErrorIcon, TextFieldChangeEvent } from '../../components/Action/utils'
import { ApolloError, gql, useMutation } from '@apollo/client'
import { getOrganizationOptionsForDropdown } from '../helpers'
import { useValidityCheck } from '../../utils/hooks'
import CancelOrSaveQuestion from './Components/CancelOrSaveQuestion'
import { QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import ErrorMessage from './Components/ErrorMessage'

interface Props {
    setIsAddingQuestion: (isAddingQuestion: boolean) => void
    barrier: Barrier
    questionTitleRef: RefObject<HTMLElement>
    selectedProjectCategory: string
}

const CreateQuestionItem = ({ setIsAddingQuestion, barrier, questionTitleRef, selectedProjectCategory }: Props) => {
    const [text, setText] = React.useState<string>('')
    const [organization, setOrganization] = React.useState<Organization>(Organization.All)
    const [supportNotes, setSupportNotes] = React.useState<string>('')

    const isTextfieldValid = () => {
        return text.length > 0
    }

    const { valueValidity } = useValidityCheck<string>(text, isTextfieldValid)

    const {
        createQuestionTemplate,
        loading: isCreateQuestionTemplateSaving,
        error: createQuestionTemplateSaveError,
    } = useCreateQuestionTemplateMutation()

    const createQuestion = () => {
        const newQuestion: DataToCreateQuestionTemplate = {
            barrier,
            organization,
            text,
            supportNotes,
            projectCategoryIds: selectedProjectCategory !== 'all' ? [selectedProjectCategory] : [],
        }

        createQuestionTemplate(newQuestion)
        setIsAddingQuestion(false)
        if (questionTitleRef !== null && questionTitleRef.current !== null) {
            questionTitleRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'} mt={0.75}>
                    <Box display="flex" ml={4} mr={2}>
                        <TextField
                            data-testid="question-title-textfield"
                            id={'title'}
                            value={text}
                            autoFocus={true}
                            label="Question"
                            onChange={(event: TextFieldChangeEvent) => {
                                setText(event.target.value)
                            }}
                            variant={valueValidity}
                            helperText={valueValidity === 'error' ? 'required' : ''}
                            helperIcon={valueValidity === 'error' ? ErrorIcon : <></>}
                        />
                    </Box>
                    <Box ml={3} mt={3} mr={1} mb={10}>
                        <MarkdownEditor
                            data-testid="markdown-editor"
                            onChange={markdown => setSupportNotes(markdown)}
                            menuItems={['strong', 'em', 'bullet_list', 'ordered_list', 'blockquote', 'h1', 'h2', 'h3', 'paragraph']}
                        >
                            {supportNotes}
                        </MarkdownEditor>
                    </Box>
                </Box>
                <Box display="flex" flexDirection={'column'}>
                    <Box flexGrow={1} data-testid="select-organization-dropdown-box">
                        <SearchableDropdown
                            label="Organization"
                            options={getOrganizationOptionsForDropdown(organization)}
                            onSelect={option => setOrganization(option.key as Organization)}
                        />
                    </Box>
                    <CancelOrSaveQuestion
                        isQuestionTemplateSaving={isCreateQuestionTemplateSaving}
                        setIsInMode={setIsAddingQuestion}
                        onClickSave={createQuestion}
                        questionTitle={text}
                    />
                </Box>
            </Box>
            {createQuestionTemplateSaveError && (
                <Box mt={2} ml={4}>
                    <ErrorMessage text={'Not able to save'} />
                </Box>
            )}
        </Box>
    )
}

export default CreateQuestionItem

export interface DataToCreateQuestionTemplate {
    barrier: Barrier
    organization: Organization
    text: string
    supportNotes: string
    projectCategoryIds: string[]
}

interface createQuestionTemplateMutationProps {
    createQuestionTemplate: (data: DataToCreateQuestionTemplate) => void
    loading: boolean
    error: ApolloError | undefined
}

const useCreateQuestionTemplateMutation = (): createQuestionTemplateMutationProps => {
    const CREATE_QUESTION_TEMPLATE = gql`
        mutation CreateQuestionTemplate(
            $barrier: Barrier!
            $organization: Organization!
            $text: String!
            $supportNotes: String!
            $projectCategoryIds: [String]
        ) {
            createQuestionTemplate(
                barrier: $barrier
                organization: $organization
                text: $text
                supportNotes: $supportNotes
                projectCategoryIds: $projectCategoryIds
            ) {
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
        error,
    }
}
