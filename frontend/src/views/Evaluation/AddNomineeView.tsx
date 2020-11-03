import * as React from 'react';
import { useApiClients, PersonDetails } from '@equinor/fusion';
import { PersonCard, Button, TextInput, SearchableDropdown, SearchableDropdownOption, Spinner } from '@equinor/fusion-components';

import { Organization, Role } from '../../api/models';

interface AddNomineeViewProps {
    onNomineeSelected: (person: PersonDetails, role: Role, organization: Organization) => void;
}

let enumToKvp = function (_enum: any): [number, string][] {
    let keys = Object.values(_enum).filter(d => typeof d === 'number') as [number];
    let values = Object.values(_enum).filter(d => typeof d === 'string') as [string];
    return keys.map(function(e, i) { return [e, values[i]]});
};

const AddNomineeView = ({ onNomineeSelected }: AddNomineeViewProps) => {
    const apiClients = useApiClients();

    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([]);

    const [selectedRole, setSelectedRole] = React.useState<Role>();
    const [selectedOrg, setSelectedOrg] = React.useState<Organization>();

    const [isSearching, setIsSearching] = React.useState<boolean>(false);

    const [orgOptions, setOrgOptions] = React.useState<SearchableDropdownOption[]>(
        enumToKvp(Organization).map(d => {
            return {
                key: d[0].toString(),
                title: d[1]
            }
        })
    );

    const [roleOptions, setRoleOptions] = React.useState<SearchableDropdownOption[]>(
        enumToKvp(Role).map(d => {
            return {
                key: d[0].toString(),
                title: d[1]
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
            setSearchResults([]);
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
                    setSelectedOrg(+item.key);
                }}
            />
            <br/>
            <SearchableDropdown
                options={roleOptions}
                label="Role"
                onSelect={item => {
                    setRoleOptions(updateRoleOptions(item))
                    setSelectedRole(+item.key);
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
            {
                searchResults.map((p) => {
                    return (
                        <div style={{marginBottom: 10}} key={p.azureUniqueId}>
                            <PersonCard person={p} />
                            <Button onClick={() => {
                                onNomineeSelected(p, selectedRole!, selectedOrg!);
                            }} disabled={selectedOrg === null || selectedRole == null}>Add</Button>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default AddNomineeView;
