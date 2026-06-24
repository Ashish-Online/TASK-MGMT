export const taskRejectedTemplate = ({
  taskTitle,
  reason,
}) => {
  return `
    <h2>Task Rejected</h2>

    <p>
      Task: ${taskTitle}
    </p>

    <p>
      Reason: ${reason}
    </p>
  `;
};