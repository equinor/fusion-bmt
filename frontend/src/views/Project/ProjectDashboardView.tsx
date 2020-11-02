import * as React from 'react';
import { Button } from '@equinor/fusion-components';
import { Link } from 'react-router-dom';

interface ProjectDashboardViewProps {
    projectID: string
}

const ProjectDashboardView: React.FC<ProjectDashboardViewProps> = (props) => {
    return (
        <div style={{margin: 20}}>
            <Link to={`/${props.projectID}/createEvaluation`}>
                <Button>Create evaluation</Button>
            </Link>
        </div>
    );
};

export default ProjectDashboardView;
