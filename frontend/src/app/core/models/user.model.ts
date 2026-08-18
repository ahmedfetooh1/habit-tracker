export interface User {
  _id: string;
  name: string;
  email: string;
  themePreference?: 'light' | 'dark';
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  themePreference?: 'light' | 'dark';
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}
