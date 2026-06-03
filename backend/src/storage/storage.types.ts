export type StorageFolder =
  | 'help-requests'
  | 'property-listings'
  | 'proof-images';

export interface UploadFileInput {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
  folder: StorageFolder;
}

export interface StoredFile {
  url: string;
  key: string;
}

export interface StorageProvider {
  uploadFile(input: UploadFileInput): Promise<StoredFile>;
  uploadFiles(inputs: UploadFileInput[]): Promise<StoredFile[]>;
  deleteFile(key: string): Promise<void>;
  deleteFiles(keys: string[]): Promise<void>;
  extractKeyFromUrl(url: string): string | null;
  isManagedUrl(url: string): boolean;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
