import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

export const GET_TASKS_BY_PROJECT = gql`
  query GetTasksByProject($projectId: ID!) {
    tasks(filters: { project: { id: { eq: $projectId } } }) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;
