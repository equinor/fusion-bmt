import React from 'react'
import { PersonAvatar, PersonCard, PersonDetails } from '@equinor/fusion-react-person'
import { Button, Switch, Typography } from '@equinor/eds-core-react'
import { Organization, Role, Participant } from '../../../../api/models'
import { useEffect } from 'react'
import { organizationToString, roleToString } from '../../../../utils/EnumToString'
import { TextField } from '@equinor/eds-core-react'
import { useEffectNotOnMount } from '../../../../utils/hooks'
import SearchableDropdown from '../../../../components/SearchableDropDown'
import SideSheet from '@equinor/fusion-react-side-sheet'
import styled from 'styled-components'
import { CircularProgress } from '@equinor/eds-core-react'
import { usePeopleApi } from '../../../../api/usePeopleApi'

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
    const apiClients = usePeopleApi()

    const [searchQuery, setSearchQuery] = React.useState<string>('')
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([])
    const [selectedRole, setSelectedRole] = React.useState<Role>(Role.Participant)
    const [selectedOrg, setSelectedOrg] = React.useState<Organization>(Organization.Commissioning)
    const [isSearching, setIsSearching] = React.useState<boolean>(false)
    const [filterEquinorUsers, setFilterEqunorUsers] = React.useState<boolean>(true)

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
    }, [searchQuery, filterEquinorUsers])

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

    const apiResponseToPersonDetails = (response: any[]): PersonDetails[] => {
        return response.map((person: any) => {
            return {
                azureId: person.azureUniquePersonId,
                name: person.name,
                jobTitle: person.jobTitle,
                department: person.department,
                mail: person.mail,
                upn: person.upn,
                mobilePhone: person.mobilePhone,
                accountType: person.accountType,
                officeLocation: person.officeLocation,
                managerAzureUniqueId: person.managerAzureUniqueId,
            }
        })
    }

    const searchPersons = async () => {
        if (searchQuery) {
            setIsSearching(true)
            try {
                // Add @equinor.com to search query to return only employees with Equinor emails
                const query = filterEquinorUsers ? searchQuery + ' @equinor.com' : searchQuery
                const res = await apiClients.search(query)
                const result = apiResponseToPersonDetails(res)
                setSearchResults(result)
            } catch (error) {
                console.error('Error searching persons:', error)
            } finally {
                setIsSearching(false)
            }
        }
    }

    const isParticipantNominated = (nomineeID: string): boolean => {
        let found = currentNominees.find(n => n.azureUniqueId == nomineeID)
        return found !== undefined
    }

    return (
        <SideSheet
            isOpen={open}
            minWidth={550}
            onClose={onCloseClick}
        >
            <SideSheet.Title title="Add nominee" />
            <SideSheet.SubTitle subTitle="" />
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
                        searchQuery={async (query: string) => {
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
                        searchQuery={async (query: string) => {
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
                    <Switch label="Only show users with @equinor.com email" checked={filterEquinorUsers} onChange={() => setFilterEqunorUsers(!filterEquinorUsers)} />
                </Wrapper>
                <SearchResults>
                    {(isSearching || createParticipantLoading) && (
                        <div style={{ justifyContent: 'center' }}>
                            <CircularProgress />
                        </div>
                    )}
                    {!isSearching &&
                        searchResults
                            .filter(p => p.azureId !== null)
                            .map(p => {
                                return (
                                    <PersonInfo style={{ marginBottom: 10 }} key={p.azureId}>
                                        <PersonAvatar azureId={p.azureId} />
                                        <Typography>{p.name}</Typography>
                                        <Typography>{p.mail}</Typography>
                                        <Button
                                            onClick={() => {
                                                onNomineeSelected(p.azureId, selectedRole, selectedOrg)
                                            }}
                                            disabled={isParticipantNominated(p.azureId)}
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
