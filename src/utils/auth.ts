import { auth } from '@canva/user';

let token = '';
export async function getAuthToken() {
  if (token) return token;

  token = await auth.getCanvaUserToken();
  return token;
}
