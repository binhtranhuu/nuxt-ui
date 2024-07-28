import type { Ref } from 'vue'
import type { Awaitable, Mutable } from './typescript'
import type { UploadAjaxError } from '../utils/ajax'

export interface UploadContext {
  accept: Ref<string>;
}

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'fail';

export interface UploadRawFile extends File {
  uid: number;
}

export interface UploadProgressEvent extends ProgressEvent {
  percent: number;
}

export interface UploadRequestOptions {
  action: string;
  method: string;
  data: Record<string, string | Blob | [string | Blob, string]>;
  filename: string;
  file: UploadRawFile;
  headers: Headers | Record<string, string | number | null | undefined>;
  onError: (evt: UploadAjaxError) => void;
  onProgress: (evt: UploadProgressEvent) => void;
  onSuccess: (response: any) => void;
  withCredentials: boolean;
}
export interface UploadFile {
  name: string;
  percentage?: number;
  status: UploadStatus;
  size?: number;
  response?: unknown;
  uid: number;
  url?: string;
  raw?: UploadRawFile;
}
export type UploadUserFile = Omit<UploadFile, 'status' | 'uid'> & Partial<Pick<UploadFile, 'status' | 'uid'>>;

export type UploadFiles = UploadFile[];

export type UploadRequestHandler = (options: UploadRequestOptions) => XMLHttpRequest | Promise<unknown>;
export interface UploadHooks {
  beforeUpload: (rawFile: UploadRawFile) => Awaitable<void | undefined | null | boolean | File | Blob>;
  beforeRemove: (uploadFile: UploadFile, uploadFiles: UploadFiles) => Awaitable<boolean>;
  onRemove: (uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
  onChange: (uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
  onPreview: (uploadFile: UploadFile) => void;
  onSuccess: (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
  onProgress: (evt: UploadProgressEvent, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
  onError: (error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) => void;
  onExceed: (files: File[], uploadFiles: UploadUserFile[]) => void;
}

export type UploadData = Mutable<Record<string, any>>;
