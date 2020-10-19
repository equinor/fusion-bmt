import React from 'react';

import { Project } from '../api/models';

import { useQuery, gql } from '@apollo/client';

import { TextArea } from '@equinor/fusion-components';

const ShowProjects = () => {
    const GET_PROJECT = gql`
        query {
            projects {
                fusionProjectId,
                createDate
            }
        }
    `;

    const { loading, data, error } = useQuery<Project>(
        GET_PROJECT
    );

    if(loading){
        return <>
            Loading...
        </>
    }

    if(error !== undefined){
        return <div>
            <TextArea
                label={JSON.stringify(error)}
                disabled={true}
                onChange={() => {}}
            />
        </div>
    }

    if(data === undefined){
        return <div>
            <TextArea
                label={"Data is undefiend"}
                disabled={true}
                onChange={() => {}}
            />
        </div>
    }

    return <div>
        <TextArea
            value={JSON.stringify(data)}
            disabled={false}
            onChange={() => {}}
        />
    </div>
}

export default ShowProjects;
