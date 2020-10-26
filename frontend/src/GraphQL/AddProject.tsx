import React from 'react';

import { gql, useMutation } from '@apollo/client';

import { Button, TextArea } from '@equinor/fusion-components';

const MutateAction = () => {
    const ADD_PROJECT = gql`
        mutation {
            createProject(
                fusionProjectID:"2"
            ){
                fusionProjectId,
                createDate,
                id
            }
        }
    `;

    const [addProject, { loading, data, error }] = useMutation(
        ADD_PROJECT, {
        update(cache, { data: { createProject } }) {
            cache.modify({
                fields: {
                    projects(existingProjects = []) {
                        const newProjectRef = cache.writeFragment({
                            id: createProject.projectId,
                            data: createProject,
                            fragment: gql`
                            fragment NewProject on Project {
                                id
                                fusionProjectId
                                createDate
                            }
                            `
                        });
                        return [...existingProjects, newProjectRef];
                    }
                }
            });
        }
    }
    );

    const addSpecificProject = () => {
        addProject();
    }

    if (loading) {
        return <>
            Loading...
        </>
    }

    if (error !== undefined) {
        return <div>
            <TextArea
                label={JSON.stringify(error)}
                disabled={true}
                onChange={() => { }}
            />
        </div>
    }

    if (data === undefined) {
        return <>
            <Button onClick={addSpecificProject}>
                Add project
            </Button>
            <div>
                <TextArea
                    label={"Data is undefiend"}
                    disabled={true}
                    onChange={() => { }}
                />
            </div>
        </>
    }

    return <>
        <Button onClick={addSpecificProject}>
            Add project
        </Button>
        <div>
            <TextArea
                label={JSON.stringify(data)}
                disabled={true}
                onChange={() => { }}
            />
        </div>
    </>
}

export default MutateAction;
