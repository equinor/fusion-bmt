import React from 'react'
import { 
    DropdownProvider,
    Dropdown,
    SearchableDropdownResolver,
    useDropdownProviderRef,
    SearchableDropdownSelectEvent,
    SearchableDropdownResult
} from '@equinor/fusion-react-searchable-dropdown'

interface Props {
    options: { id: string; title: string; isSelected: boolean; }[]
    searchQuery: (queryString: string) => SearchableDropdownResult | Promise<SearchableDropdownResult>
    onSelect: (event: any) => void
    label: string
    value: string | undefined
}

const SearchableDropdown = ({ options, searchQuery, onSelect, label, value }: Props) => {
    const dropDownResolver: SearchableDropdownResolver = {
        initialResult: options,
        searchQuery: searchQuery,
    }
    const dropdownProviderRef = useDropdownProviderRef(dropDownResolver)

    return (
        <DropdownProvider ref={dropdownProviderRef}>
            <Dropdown
                label={label}
                value={value}
                onSelect={onSelect}
            />
        </DropdownProvider>
    )
}

export default SearchableDropdown
