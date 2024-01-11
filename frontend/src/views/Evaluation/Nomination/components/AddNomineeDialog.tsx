import React from 'react'
import { useApiClients, PersonDetails } from '@equinor/fusion'
import { PersonCard, Spinner } from '@equinor/fusion-components'
import { Button } from '@equinor/eds-core-react'
import { Organization, Role, Participant } from '../../../../api/models'
import { useEffect } from 'react'
import { organizationToString, roleToString } from '../../../../utils/EnumToString'
import { TextField } from '@equinor/eds-core-react'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import SearchableDropdown from '../../../../components/SearchableDropDown'
import SideSheet from '@equinor/fusion-react-side-sheet'
import styled from 'styled-components'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const SearchResults = styled.div`
    padding: 20px 0;
`

const PersonInfo = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
`
interface AddNomineeDialogProps {
    currentNominees: Array<Participant>
    open: boolean
    onCloseClick: () => void
    onNomineeSelected: (azureUniqueId: string, role: Role, organization: Organization) => void
    createParticipantLoading: boolean
}

const WRITE_DELAY_MS = 1000

const AddNomineeDialog = ({ currentNominees, open, onCloseClick, onNomineeSelected, createParticipantLoading }: AddNomineeDialogProps) => {
    const apiClients = useApiClients()

    const [searchQuery, setSearchQuery] = React.useState<string>('')
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([])
    const [selectedRole, setSelectedRole] = React.useState<Role>(Role.Participant)
    const [selectedOrg, setSelectedOrg] = React.useState<Organization>(Organization.Commissioning)
    const [isSearching, setIsSearching] = React.useState<boolean>(false)

    const [orgOptions, setOrgOptions] = React.useState(
        Object.entries(Organization).map(([key, org]) => {
            return {
                id: key,
                title: organizationToString(org),
            }
        })
    )

    const [roleOptions, setRoleOptions] = React.useState(
        Object.entries(Role).map(([key, role]) => {
            return {
                id: key,
                title: roleToString(role),
            }
        })
    )

    useEffectNotOnMount(() => {
        if (!createParticipantLoading) {
            setSearchQuery('')
            setSearchResults([])
        }
    }, [createParticipantLoading])

    useEffect(() => {
        const timeout = setTimeout(() => {
            searchPersons()
        }, WRITE_DELAY_MS)
        return () => {
            clearTimeout(timeout)
        }
    }, [searchQuery])

    const updateOrgOptions = (item: any) =>
        setOrgOptions(oldOptions =>
            oldOptions.map(option => {
                return {
                    ...option,
                    isSelected: item.id === option.id,
                }
            })
        )

    const updateRoleOptions = (item: any) =>
        setRoleOptions(oldOptions =>
            oldOptions.map(option => {
                return { ...option, isSelected: item.id === option.id }
            })
        )

    const searchPersons = () => {
        if (searchQuery) {
            setIsSearching(true)
            apiClients.people
                .searchPersons(searchQuery)
                .then(res => {
                    setSearchResults(res.data)
                })
                .finally(() => {
                    setIsSearching(false)
                })
        }
    }

    const isParticipantNominated = (nomineeID: string): boolean => {
        let found = currentNominees.find(n => n.azureUniqueId == nomineeID)
        return found !== undefined
    }

    return (
        <SideSheet 
            isOpen={open} 
            minWidth={400}
            onClose={onCloseClick}
        >
            <SideSheet.Title title="Create Evaluation" />
            <SideSheet.SubTitle subTitle="Create a new evaluation" />
            <SideSheet.Content>
                <Wrapper data-testid="nominee_dialog_body">
                    <SearchableDropdown
                        options={orgOptions}
                        value={selectedOrg}
                        label="Organization"
                        onSelect={option => {
                            const selectedOption = (option as any).nativeEvent.detail.selected[0]
                            updateOrgOptions(selectedOption)
                            setSelectedOrg(Organization[selectedOption.id as keyof typeof Organization])
                        }} 
                        searchQuery={ async (query: string) => {
                            return orgOptions.filter(option => option.title.toLowerCase().includes(query.toLowerCase()))
                        }}
                    />
                    <SearchableDropdown
                        options={roleOptions}
                        value={selectedRole}
                        label="Role"
                        onSelect={option => {
                            const selectedOption = (option as any).nativeEvent.detail.selected[0]
                            updateRoleOptions(selectedOption)
                            setSelectedRole(Role[selectedOption.id as keyof typeof Role])
                        }}
                        searchQuery={ async (query: string) => {
                            return roleOptions.filter(option => option.title.toLowerCase().includes(query.toLowerCase()))
                        }}
                    />
                    <TextField
                        id="" // avoids error
                        autoFocus={true}
                        onChange={(e: any) => {
                            setSearchQuery(e.target.value)
                        }}
                        value={searchQuery}
                        type="search"
                        placeholder="Search for person..."
                        data-testid="nominee_dialog_search_text_field"
                    />
                </Wrapper>
                <SearchResults>
                    {(isSearching || createParticipantLoading) && (
                        <div style={{ justifyContent: 'center' }}>
                            <Spinner />
                        </div>
                    )}
                    {!isSearching &&
                        searchResults
                            .filter(p => p.azureUniqueId !== null)
                            .map(p => {
                                return (
                                    <PersonInfo style={{ marginBottom: 10 }} key={p.azureUniqueId}>
                                        <PersonCard person={p} />
                                        <Button
                                            onClick={() => {
                                                onNomineeSelected(p.azureUniqueId, selectedRole, selectedOrg)
                                            }}
                                            disabled={isParticipantNominated(p.azureUniqueId)}
                                        >
                                            Add
                                        </Button>
                                    </PersonInfo>
                                )
                            })}
                </SearchResults>
            </SideSheet.Content>
        </SideSheet>
    )
}

export default AddNomineeDialog
