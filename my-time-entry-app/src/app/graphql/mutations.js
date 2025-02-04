const CREATE_TIME_ENTRY = gql`
  mutation CreateTimeEntry($taskId: ID!, $hours: Float!, $date: String!) {
    createTimeEntry(input: { data: { task: $taskId, hours: $hours, date: $date } }) {
      timeEntry {
        id
      }
    }
  }
`;

const handleSubmit = () => {
  client
    .mutate({
      mutation: CREATE_TIME_ENTRY,
      variables: {
        taskId: selectedTask,
        hours: parseFloat(timeEntry),
        date: new Date().toISOString(),
      },
    })
    .then(() => {
      console.log("Time Entry Submitted");
      setOpen(false);
    })
    .catch((error) => console.error("Error submitting time entry:", error));
};
