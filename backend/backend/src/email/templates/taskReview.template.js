export const taskReviewTemplate = ({
  reviewerName,
  taskTitle,
  priority,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      
      <h2>Task Ready For Review</h2>

      <p>
        Hello ${reviewerName},
      </p>

      <p>
        A task has been completed and is waiting for your review.
      </p>

      <hr />

      <p>
        <strong>Task:</strong>
        ${taskTitle}
      </p>

      <p>
        <strong>Priority:</strong>
        ${priority}
      </p>

      <hr />

      <p>
        Please review the task.
      </p>

    </div>
  `;
};