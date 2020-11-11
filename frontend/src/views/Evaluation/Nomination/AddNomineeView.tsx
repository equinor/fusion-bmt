import * as React from 'react';
import { useApiClients, PersonDetails } from '@equinor/fusion';
import { PersonCard, Button, TextInput, SearchableDropdown, SearchableDropdownOption, Spinner } from '@equinor/fusion-components';

import { Organization, Role } from '../../../api/models';

interface AddNomineeViewProps {
    onNomineeSelected: (person: PersonDetails, role: Role, organization: Organization) => void;
}

const AddNomineeView = ({ onNomineeSelected }: AddNomineeViewProps) => {
    const apiClients = useApiClients();

    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([]);

    const [selectedRole, setSelectedRole] = React.useState<Role>(Role.Participant);
    const [selectedOrg, setSelectedOrg] = React.useState<Organization>(Organization.Commissioning);

    const [isSearching, setIsSearching] = React.useState<boolean>(false);

    const [orgOptions, setOrgOptions] = React.useState<SearchableDropdownOption[]>(
        Object.entries(Organization).map(([key, org]) => {
            return {
                key: key,
                title: org,
                isSelected: (selectedOrg === org)
            }
        })
    );

    const [roleOptions, setRoleOptions] = React.useState<SearchableDropdownOption[]>(
        Object.entries(Role).map(([key, role]) => {
            return {
                key: key,
                title: role,
                isSelected: (selectedRole === role)
            }
        })
    );

    const updateOrgOptions = (item: SearchableDropdownOption) =>
        orgOptions.map(option => {
            return { ...option, isSelected: item.key === option.key };
        });

    const updateRoleOptions = (item: SearchableDropdownOption) =>
        roleOptions.map(option => {
            return { ...option, isSelected: item.key === option.key };
        });

    const searchPersons = () => {
        if (searchQuery) {
            setIsSearching(true);
            apiClients.people.searchPersons(searchQuery)
                .then((res) => {
                    setSearchResults(res.data);
                })
                .finally(() => {
                    setIsSearching(false);
                })
        }
    }

    return (
        <div style={{margin: 20}}>
            <SearchableDropdown
                options={orgOptions}
                label="Orgnization"
                onSelect={item => {
                    setOrgOptions(updateOrgOptions(item))
                    setSelectedOrg(item.key as Organization);
                }}
            />
            <br/>
            <SearchableDropdown
                options={roleOptions}
                label="Role"
                onSelect={item => {
                    setRoleOptions(updateRoleOptions(item))
                    setSelectedRole(item.key as Role);
                }}
            />
            <br/>
            <TextInput
                value={searchQuery}
                onChange={(v) => setSearchQuery(v)}
                placeholder="Search for person..."
                disabled={isSearching}
                onKeyUp={(ev) => {
                    if (ev.key === 'Enter') {
                        searchPersons()
                    }
                }}
            />
            <br/>
            { isSearching &&
                <div style={{justifyContent: "center"}}>
                    <Spinner />
                </div>
            }
            { !isSearching &&
                searchResults.map((p) => {
                    return (
                        <div style={{marginBottom: 10}} key={p.azureUniqueId}>
                            <PersonCard person={p} />
                            <Button onClick={() => {
                                onNomineeSelected(p, selectedRole!, selectedOrg!);
                            }}>Add</Button>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default AddNomineeView;
