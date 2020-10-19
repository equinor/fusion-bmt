import * as React from 'react';
import { useApiClients, PersonDetails } from '@equinor/fusion';
import { PersonCard, Button, TextInput, SearchableDropdown, SearchableDropdownOption } from '@equinor/fusion-components';

import { Organization } from '../../api/models';

interface AddNomineeViewProps {
    onNomineeSelected: (person: PersonDetails) => void;
}

const AddNomineeView = ({ onNomineeSelected }: AddNomineeViewProps) => {
    const apiClients = useApiClients();
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([]);

    const [options, setOptions] = React.useState<SearchableDropdownOption[]>(
        Object.values(Organization).filter(d => typeof d === 'string').map(d => {
            return {
                key: d as string,
                title: d as string
            }
        })
    );

    const updateOptions = (item: SearchableDropdownOption) =>
        options.map(option => {
            return { ...option, isSelected: item.key === option.key };
        });
    
    const searchPersons = () => {
        apiClients.people.searchPersons(searchQuery)
            .then((res) => {
                setSearchResults(res.data);
            })
    }

    return (
        <div style={{margin: 20}}>
            <SearchableDropdown
                options={options}
                label="Discipline"
                onSelect={item => setOptions(updateOptions(item))}
            />
            <br/>
            <TextInput
                value={searchQuery}
                onChange={(v) => setSearchQuery(v)}
                placeholder="Search for person..."
                onKeyUp={(ev) => {
                    if (ev.key === 'Enter') {
                        searchPersons()
                    }
                }}
                />
            <br/>
            {
                searchResults.map((p) => {
                    return (
                        <div style={{marginBottom: 10}} key={p.azureUniqueId}>
                            <PersonCard person={p} />
                            <Button onClick={() => {
                                onNomineeSelected(p);
                            }}>Add</Button>
                        </div>
                    );
                })
            }
        </div>
    );
};

export default AddNomineeView;
