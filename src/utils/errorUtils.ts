export const handleDBError = (
  condition: boolean,
  message: string,
  status: number
) => {
  if (condition) throw Object.assign(new Error(message), { status });
};
