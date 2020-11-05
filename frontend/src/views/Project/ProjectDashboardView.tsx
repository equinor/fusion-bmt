import * as React from 'react';
import { Button } from '@equinor/fusion-components';
import { Link } from 'react-router-dom';
import { Project } from '../../api/models';

interface ProjectDashboardViewProps {
    project: Project
}

const ProjectDashboardView = ({project}: ProjectDashboardViewProps) => {
    return (
        <div style={{margin: 20}}>
            <Link to={`/${project.fusionProjectId}/createEvaluation`}>
                <Button>Create evaluation</Button>
            </Link>
        </div>
    );
};

export default ProjectDashboardView;
