export interface CloudinarySignatureResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  [key: string]: any;
}
