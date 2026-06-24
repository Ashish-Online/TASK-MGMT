export const taskAssignedTemplate = ({
  taskTitle,
  priority,
}) => {
  return `
    <h2>New Task Assigned</h2>

    <p>
      Task: ${taskTitle}
    </p>

    <p>
      Priority: ${priority}
    </p>
  `;
};