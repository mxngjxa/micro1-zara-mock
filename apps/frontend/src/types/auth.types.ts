export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}