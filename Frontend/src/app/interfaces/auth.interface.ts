// src/app/interfaces/auth.interface.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  role: string;
  token: string;
}