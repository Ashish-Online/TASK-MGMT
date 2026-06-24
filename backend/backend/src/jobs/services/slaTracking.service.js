export const calculateSLA = (createdAt, completedAt) => {
  const start = new Date(createdAt);
  const end = new Date(completedAt);

  const diffHours =
    Math.abs(end - start) / (1000 * 60 * 60);

  return {
    hoursTaken: diffHours,
    isDelayed: diffHours > 48, // example SLA = 48 hours
  };
};