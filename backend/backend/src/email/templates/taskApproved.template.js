export const taskApprovedTemplate = ({
  taskTitle,
}) => {
  return `
    <h2>Task Approved</h2>

    <p>
      Your task "${taskTitle}"
      has been approved.
    </p>
  `;
};