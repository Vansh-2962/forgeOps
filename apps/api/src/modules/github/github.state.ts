const stateStore = new Map<string, string>();

export const saveState = (state: string, userId: string) => {
  stateStore.set(state, userId);
};

export const getUserId = (state: string) => {
  return stateStore.get(state);
};

export const deleteState = (state: string) => {
  stateStore.delete(state);
};
