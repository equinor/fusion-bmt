import {
    DropdownProvider,
    Dropdown,
    SearchableDropdownResolver,
    useDropdownProviderRef,
    SearchableDropdownResult
} from '@equinor/fusion-react-searchable-dropdown'
import { Label } from '@equinor/eds-core-react';
import { Grid } from '@mui/material';

interface Props {
    options: { id: string; title: string | undefined; }[]
    searchQuery: (queryString: string) => SearchableDropdownResult | Promise<SearchableDropdownResult>
    onSelect: (event: any) => void
    onReset?: (event: any) => void
    label: string
    value: string | undefined
    disabled?: boolean
    required?: boolean
    variant?: string
}

const SearchableDropdown = ({ options, searchQuery, onSelect, onReset, label, value, required = true, disabled = false, variant = "page-dense" }: Props) => {
    const dropDownResolver: SearchableDropdownResolver = {
        initialResult: options,
        searchQuery: searchQuery,
    }
    const dropdownProviderRef = useDropdownProviderRef(dropDownResolver)

    return (
        <DropdownProvider ref={dropdownProviderRef}>
            <Grid container justifyContent="space-between">
                <Grid item>
                    <Label label={label} />
                </Grid>
                {!required && <Grid item>
                    <Label label="(Optional)" />
                </Grid>}
                <Grid item xs={12}>
                    <Dropdown
                        value={value}
                        onSelect={onSelect}
                        onReset={onReset}
                        disabled={disabled}
                        variant={variant}
                    />
                </Grid>
            </Grid>
        </DropdownProvider>
    )
}

export default SearchableDropdown
