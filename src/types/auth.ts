export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    username: string;
    email: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
    country?: string;
  };
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  roles?: string[];
}

export interface PasswordResetRequestDTO {
  email: string;
}

export interface PasswordResetDTO {
  token: string;
  newPassword: string;
}

export interface VerificationRequest {
  token: string;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
} 