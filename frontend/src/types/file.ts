/**
 * DataShare file management types
 * Aligned with Backend Entity: File
 * @see specification_fonctionnelles.pdf
 */

/**
 * File status (Calculated on the front end or via expirationDate)
 */
export type FileStatus = 'active' | 'expired';

/**
 * Information from an uploaded file (Mirror of the TypeORM entity)
 * Used in history (US05) and download (US02)
 */
export interface SharedFile {
  /** Unique identifier */
  id: string;
  
  /** Original file name */
  filename: string;
  
  /** Size in bytes */
  size: number;
  
  /** MIME type */
  mimetype: string;
  
  /** Unique token for the download link */
  token: string;
  
  /** Path on disk */
  path?: string; 

  /** Upload date */
  uploadDate: string;
  
  /** Expiration date */
  expirationDate: string;
  
  /** Related tags (US08) */
  tags: string[] | null;
  
  /** Number of downloads */
  downloadCount: number;
  
  /** Calculated field */
  hasPassword?: boolean;
  
  /** Owner (TypeORM Relationship) */
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * Data to create a new file (upload)
 * @see US01
 */
export interface CreateFileRequest {
  /** The file to upload (JS Blob/File) */
  file: File;
  
  /** Optional password (minimum 6 characters) */
  password?: string;
  
  /** Duration before expiry (in days) */
  expirationDays?: number;
  
  /** Optional tags */
  tags?: string[];
}

/**
 * Response after successful upload
 */
export interface CreateFileResponse extends SharedFile {
  /** Full download URL */
  url: string;
}

/**
 * Data to download a protected file
 * @see US02
 */
export interface DownloadFormData {
  /** File token */
  token: string;
  
  /** Password if required */
  password?: string;
}

/**
 * Public information about a file (before downloading)
 * Visible even without a password
 * @see US02
 */
export interface FileMetadata {
  /** File name */
  name: string;
  
  /** Size in bytes */
  size: number;
  
  /** MIME type */
  mimetype: string;
  
  /** Expiration date */
  expirationDate: string;
  
  /** Password protected file */
  hasPassword: boolean;
}

/**
 * Filtering settings for history
 * @see US05
 */
export interface FileFilters {
  tag?: string;
  search?: string;
}

/**
 * Tag for a file
 * @see US08
 */
export interface FileTag {
  label: string;
  count?: number;
}