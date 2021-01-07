export const randomId = () =>
  Math.random()
    .toString(36)
    .substring(2, 9);

export const throwError = (message?: string) => {
  throw new Error(message);
};
