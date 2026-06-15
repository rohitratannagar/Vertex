export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  status?: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  chunksStored?: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ThemeMode = string;
