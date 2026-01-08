/**
 * DataShare User Management Types
 * Aligned with Backend Entity: User
 * @see US03,US04
 */

export interface User {
  /** Unique identifier */
  id: string;
  
  /** Unique email address */
  email: string;
  
  /** Account creation date (ISO string) */
  createdAt: string;
  
  /** Date of last modification (ISO string) */
  updatedAt: string;
}

/**
 * Information needed to create an account (register)
 * @see US03
 */
export interface CreateUserRequest {
  email: string;
  password: string;
}

/**
 * Login details
 * @see US04
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response after successful login
 */
export interface LoginResponse {
  accessToken: string;
  user: User;
}

/**
 * Possible auth errors (Used for UX display)
 */
export type AuthError =
  | 'email_invalid'
  | 'email_taken'
  | 'password_too_short'
  | 'invalid_credentials'
  | 'unauthorized';