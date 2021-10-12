import { ApolloError, gql, useMutation } from '@apollo/client'
import { RefObject, useState } from 'react'
import { MarkdownEditor, SearchableDropdown } from '@equinor/fusion-components'
import { TextField, Typography } from '@equinor/eds-core-react'
import { Box } from '@material-ui/core'

import { QUESTIONTEMPLATE_FIELDS_FRAGMENT } from '../../api/fragments'
import { ErrorIcon, TextFieldChangeEvent } from '../../components/Action/utils'
import { Barrier, Organization, QuestionTemplate } from '../../api/models'
import { useValidityCheck } from '../../utils/hooks'
import { getOrganizationOptionsForDropdown } from '../helpers'
import CancelOrSaveQuestion from './Components/CancelOrSaveQuestion'
import ErrorMessage from './Components/ErrorMessage'

interface Props {
    setQuestionTemplateToCopy: (original: QuestionTemplate | undefined) => void
    questionTemplateToCopy: QuestionTemplate
    setIsCopyingQuestion: (val: boolean) => void
    barrier: Barrier
    questionTitleRef: RefObject<HTMLElement>
}

const CopyQuestionItem = ({ setQuestionTemplateToCopy, questionTemplateToCopy, setIsCopyingQuestion, barrier, questionTitleRef }: Props) => {
    const [text, setText] = useState<string>(questionTemplateToCopy.text)
    const [organization, setOrganization] = useState<Organization>(questionTemplateToCopy.organization)
    const [supportNotes, setSupportNotes] = useState<string>(questionTemplateToCopy.supportNotes)

    const isTextfieldValid = () => {
        return text.length > 0
    }

    const { valueValidity } = useValidityCheck<string>(text, isTextfieldValid)

    const {
        copyQuestionTemplate,
        loading: isCopyQuestionTemplateSaving,
        error: copyQuestionTemplateSaveError,
    } = useCopyQuestionTemplateMutation()

    const copyQuestion = () => {
        const newQuestion: DataToCopyQuestionTemplate = {
            barrier,
            organization,
            text,
            supportNotes,
            projectCategoryIds: questionTemplateToCopy.projectCategories.map(pc => {return pc.id}),
            newOrder: questionTemplateToCopy.order + 1,
        }

        copyQuestionTemplate(newQuestion)
        setQuestionTemplateToCopy(undefined)
        setIsCopyingQuestion(false)
        if (questionTitleRef !== null && questionTitleRef.current !== null) {
            questionTitleRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <Box display="flex" flexDirection="column">
            <Box ml={2} mr={1} mt={1} mb={3}>
                <Typography variant="h4">Copy question: "{questionTemplateToCopy.text}"</Typography>
            </Box>
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexGrow={1} flexDirection={'column'} mt={0.75}>
                    <Box display="flex" alignItems={'center'}>    
                        <Box ml={2} mr={1} mt={2}>
                            <Typography variant="h4">{questionTemplateToCopy.order + 1}.</Typography>
                        </Box>
                        <Box display="flex" width={'100%'} mr={2}>
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
                        isQuestionTemplateSaving={isCopyQuestionTemplateSaving}
                        setIsInMode={setIsCopyingQuestion}
                        onClickSave={copyQuestion}
                        questionTitle={text}
                    />
                </Box>
            </Box>
            {copyQuestionTemplateSaveError && (
                <Box mt={2} ml={4}>
                    <ErrorMessage text={'Not able to save'} />
                </Box>
            )}
        </Box>
    )
}

export default CopyQuestionItem

interface DataToCopyQuestionTemplate {
    barrier: Barrier
    organization: Organization
    text: string
    supportNotes: string
    projectCategoryIds: string[]
    newOrder: number
}

interface copyQuestionTemplateMutationProps {
    copyQuestionTemplate: (data: DataToCopyQuestionTemplate) => void
    loading: boolean
    error: ApolloError | undefined
}

const useCopyQuestionTemplateMutation = (): copyQuestionTemplateMutationProps => {
    const CREATE_QUESTION_TEMPLATE = gql`
        mutation CreateQuestionTemplate(
            $barrier: Barrier!
            $organization: Organization!
            $text: String!
            $supportNotes: String!
            $projectCategoryIds: [String]
            $newOrder: Int!
        ) {
            createQuestionTemplate(
                barrier: $barrier
                organization: $organization
                text: $text
                supportNotes: $supportNotes
                projectCategoryIds: $projectCategoryIds
                newOrder: $newOrder
            ) {
                ...QuestionTemplateFields
            }
        }
        ${QUESTIONTEMPLATE_FIELDS_FRAGMENT}
    `

    const [copyQuestionTemplateApolloFunc, { loading, data, error }] = useMutation(CREATE_QUESTION_TEMPLATE, {
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

    const copyQuestionTemplate = (data: DataToCopyQuestionTemplate) => {
        copyQuestionTemplateApolloFunc({
            variables: { ...data },
        })
    }

    return {
        copyQuestionTemplate,
        loading,
        error,
    }
}
