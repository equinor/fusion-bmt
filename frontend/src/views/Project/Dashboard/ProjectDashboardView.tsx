import * as React from 'react';

import { Project } from '../../../api/models';
import CreateEvaluationButton from './CreateEvaluationButton';

interface ProjectDashboardViewProps {
    project: Project
}

const ProjectDashboardView = ({project}: ProjectDashboardViewProps) => {
    return (
        <div style={{margin: 20}}>
            <CreateEvaluationButton projectId={project.id}/>
        </div>
    );
}

export default ProjectDashboardView;
