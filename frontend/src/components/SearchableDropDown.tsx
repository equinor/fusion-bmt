import {useRef, useEffect} from 'react'
import {
    DropdownProvider,
    Dropdown,
    SearchableDropdownResolver,
    useDropdownProviderRef,
    SearchableDropdownResult
} from '@equinor/fusion-react-searchable-dropdown'
import { Label, Typography } from '@equinor/eds-core-react';
import { Grid } from '@mui/material';

interface Props {
    options: { id: string; title: string | undefined; }[]
    searchQuery: (queryString: string) => SearchableDropdownResult | Promise<SearchableDropdownResult>
    onSelect: (event: any) => void
    onClick?: (event: any) => void
    onChange?: (event: any) => void
    closeHandler?: (event: any) => void
    label: string
    value: string | undefined
    required?: boolean
    disabled?: boolean | undefined
}

const SearchableDropdown = ({ options, searchQuery, onSelect, onClick, onChange, closeHandler, label, value, required = true, disabled }: Props) => {
    const dropDownResolver: SearchableDropdownResolver = {
        initialResult: options,
        searchQuery: searchQuery,
        closeHandler: closeHandler,
    }
    const dropdownProviderRef = useDropdownProviderRef(dropDownResolver)
    return (
        <DropdownProvider ref={dropdownProviderRef}>
            <Grid container justifyContent="space-between">
                <Grid item>
                    <Label label={label} />
                </Grid>
                {!required && (
                    <Grid item>
                        <Label label="(Optional)" />
                </Grid>)}
            </Grid>
            <Dropdown
                value={value}
                onSelect={onSelect}
                aria-required={required}
                onClick={onClick}
                onChange={onChange}
                disabled={disabled}
            />
        </DropdownProvider>
    )
}

export default SearchableDropdown
