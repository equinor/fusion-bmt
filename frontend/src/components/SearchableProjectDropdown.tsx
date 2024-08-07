import { useState, useEffect, useRef } from 'react'
import SearchableDropdown from './SearchableDropDown';
import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useAppContext } from '../context/AppContext';
import { Context } from '@equinor/fusion';
import { ProjectOption } from '../api/models';
import { useProjectQuery } from '../views/Project/ProjectTabs';
import { useContextApi } from '../api/useContextApi';

const SearchableProjectDropdown = () => {
    const apiClients = useContextApi()
    const { currentContext } = useModuleCurrentContext()
    const loadingResults: ProjectOption = {
        title: 'Loading...',
        id: '',
    }
    const [selectedProject, setSelectedProject] = useState<ProjectOption | undefined>(undefined)
    const { project } = useProjectQuery('', selectedProject?.id ?? '')
    const { projects, isFetchingProjects, currentProject, setCurrentProject } = useAppContext()
    const [dropdownProjects, setDropdownProjects] = useState<ProjectOption[]>([])

    useEffect(() => {   
        if (!isFetchingProjects && projects.length > 0) {
            setDropdownProjects(projects.filter((project: Context) => (
                project.type.id === "ProjectMaster" &&
                    {
                    id: project.externalId,
                    title: project.title,
                })))
        }
        if (isFetchingProjects) {
            setDropdownProjects([loadingResults])
        }
    }, [projects, isFetchingProjects])

    useEffect(() => {
        console.log('project', project)
        console.log('selectedProject', selectedProject)
        console.log('currentProject', currentProject)
        if (project) {
            console.log(apiClients.getById(project.fusionProjectId))
        }
        if (project && selectedProject && project.fusionProjectId === selectedProject.id) {
            setSelectedProject({id: project.fusionProjectId, title: selectedProject.title})
        }
        if (project && selectedProject && project.fusionProjectId === selectedProject.id && !currentProject) {
            setCurrentProject(selectedProject)
        }
        if (project && project.externalId === "") {
            setCurrentProject(undefined)
        }
    }, [project, selectedProject, currentProject])
    

    return (
        <SearchableDropdown
            label="Project"
            value={currentContext ? currentContext.title : selectedProject?.title}
            onSelect={selectedProject => {
                const dropdownProject = (selectedProject as any).nativeEvent.detail.selected[0]
                console.log('dropdownProject', dropdownProject)
                setSelectedProject({id: dropdownProject.externalId, title: dropdownProject.title})
            }}
            options={dropdownProjects.filter(dropdownProject => dropdownProject.id !== null)}
            searchQuery={async (searchTerm: string) => {
                if (isFetchingProjects) {
                    return [loadingResults]
                }
                return dropdownProjects.filter((project) => {
                    return project.title.toLowerCase().includes(searchTerm.toLowerCase())
                })
            }}
            closeHandler={(e: any) => e.target.value === undefined && setSelectedProject(undefined)}
            disabled={currentContext !== undefined && currentContext !== null}
        />
    )
}

export default SearchableProjectDropdown
