import * as React from 'react';
import { PersonCard, Button, ModalSideSheet } from '@equinor/fusion-components';
import AddNomineeView from './AddNomineeView';
import { PersonDetails } from '@equinor/fusion';

interface NominationViewProps {
    evaluationTitle: string
}

const NominationView = ({ evaluationTitle }: NominationViewProps) => {
    const [panelOpen, setPanelOpen] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<PersonDetails[]>([]);

    return (
        <div style={{margin: 20}}>
            <h2>{evaluationTitle}</h2>
            {
                searchResults.map((p) => {
                    return (
                        <div style={{marginBottom: 10}} key={p.azureUniqueId}>
                            <PersonCard person={p} />
                        </div>
                    );
                })
            }

            <Button
                onClick={() => {
                    setPanelOpen(true);
                }}
            >
                Add Person
            </Button>
            <ModalSideSheet
                header="Add Person"
                show={panelOpen}
                size='medium'
                onClose={() => {
                    setPanelOpen(false);
                }}
                isResizable={false}
            >
                <AddNomineeView onNomineeSelected={ (person) => {
                    setPanelOpen(false);
                    setSearchResults([...searchResults, person]);
                }}/>
            </ModalSideSheet>
        </div>
    );
};

export default NominationView;
