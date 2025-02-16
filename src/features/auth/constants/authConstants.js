export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  USERS: '/users',
  PROFILE: '/profile',
  SECURITY: '/security',
  SETTINGS: '/settings'
};

export const USER_ROLES = {
  ADMIN: {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access and control',
    color: 'error'
  },
  MODERATOR: {
    value: 'MODERATOR',
    label: 'Moderator',
    description: 'Content and user management',
    color: 'warning'
  },
  USER: {
    value: 'USER',
    label: 'User',
    description: 'Standard user access',
    color: 'info'
  }
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  REGISTRATION_FAILED: 'Registration failed',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  VERIFICATION_FAILED: 'Email verification failed',
  INVALID_TOKEN: 'Invalid or expired token'
};

export const AUTH_SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email to verify your account.',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset instructions have been sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
  EMAIL_VERIFICATION_SENT: 'Verification email has been sent to your email address'
};

// Ensure USER role is always included in role selections
export const ensureUserRole = (roles) => {
  if (!roles.includes('USER')) {
    return [...roles, 'USER'];
  }
  return roles;
}; 