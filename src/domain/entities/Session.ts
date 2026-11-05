import { UserProfile } from './UserProfile';

export interface Session {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}
