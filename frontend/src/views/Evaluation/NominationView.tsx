import * as React from 'react';
import { PersonCard, Button, ModalSideSheet, DataTable, DataTableColumn, PersonDetail } from '@equinor/fusion-components';
import AddNomineeView from './AddNomineeView';
import { PersonDetails } from '@equinor/fusion';
import { Organization, Role } from '../../api/models';
import { Box } from '@material-ui/core';
import { Link } from 'react-router-dom';

interface NominationViewProps {
    evaluationTitle: string
}

export type NomineeItem = {
    organization: Organization;
    role: Role;
    details: PersonDetails;
};

interface NomineeDisplayItemProps {
    item: NomineeItem;
    rowIndex: number;
};

const PersonCardRenderer: React.FC<NomineeDisplayItemProps> = ({ item }) => (
    <div style={{padding: 5}}>
        <PersonCard person={item.details} />
    </div>
);

const columns: DataTableColumn<NomineeItem>[] = [
    {
        key: 'person',
        accessor: 'details',
        label: 'Details',
        sortable: false,
        component: PersonCardRenderer
    },
    {
        key: 'role',
        accessor: 'role',
        label: 'Role',
        sortable: false,
    },
    {
        key: 'organization',
        accessor: 'organization',
        label: 'Organization',
        sortable: false,
    },
];

const NominationView = ({ evaluationTitle }: NominationViewProps) => {
    const [panelOpen, setPanelOpen] = React.useState(false);
    const [nominees, setNominees] = React.useState<NomineeItem[]>([]);

    return (
        <div style={{margin: 20}}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <h2>{evaluationTitle}</h2>
                </Box>
                <Box>
                    <Link to={`./preparation`}>
                        <Button>
                            Create
                        </Button>
                    </Link>
                </Box>
            </Box>

            <Button
                onClick={() => {
                    setPanelOpen(true);
                }}
            >
                Add Person
            </Button>

            <DataTable
                columns={columns}
                data={nominees}
                isFetching={false}
                rowIdentifier={'organization'}
            />

            <ModalSideSheet
                header="Add Person"
                show={panelOpen}
                size='medium'
                onClose={() => {
                    setPanelOpen(false);
                }}
                isResizable={false}
            >
                <AddNomineeView onNomineeSelected={ (details, role, organization) => {
                    setNominees([...nominees, {details, role, organization} as NomineeItem]);
                }}/>
            </ModalSideSheet>
        </div>
    );
};

export default NominationView;
