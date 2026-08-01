export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface UserProfile {
  username: string;
  upiId: string;
  upiDisplayName: string;
}

