const global = {};

export function getGlobal(key: string) {
  return global[key];
}

export function setGlobal(key: string, value) {
  return (global[key] = value);
}
