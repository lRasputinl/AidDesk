import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../types';
import { Role } from '../types';

const NAME_ID_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const EMAIL_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

export interface DecodedUser {
  id: string;
  role: Role;
  email: string;
}

export function decodeToken(token: string): DecodedUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      id: payload[NAME_ID_CLAIM],
      role: payload[ROLE_CLAIM] as Role,
      email: payload[EMAIL_CLAIM],
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
