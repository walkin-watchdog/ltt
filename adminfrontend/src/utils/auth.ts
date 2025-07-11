export const isTokenExpired = (token: string): boolean => {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    console.warn('isTokenExpired: invalid token format');
    return true;
  }
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const isTokenNearExpiry = (
  token: string,
  thresholdMinutes: number = 5
): boolean => {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    console.warn('isTokenNearExpiry: invalid token format');
    return true;
  }
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return payload.exp * 1000 < Date.now() + thresholdMinutes * 60 * 1000;
  } catch {
    return true;
  }
};