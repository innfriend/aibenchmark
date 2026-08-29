export interface ModelInfo {
  id: string;
  name: string;
  badge?: string;
  category: string;
  contextWindow: string;
  maxOutputTokens: number;
  description: string;
  supportsThinking?: boolean;
  supportsTools?: boolean;
  supportsJson?: boolean;
  supportsMultimodal?: boolean;
}

export interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  systemInstruction: string;
  thinkingLevel?: 'HIGH' | 'LOW' | 'MINIMAL';
  responseMimeType?: 'text/plain' | 'application/json';
  safetySettings?: {
    harassment: 'BLOCK_NONE' | 'BLOCK_LOW' | 'BLOCK_MEDIUM' | 'BLOCK_HIGH';
    hateSpeech: 'BLOCK_NONE' | 'BLOCK_LOW' | 'BLOCK_MEDIUM' | 'BLOCK_HIGH';
    sexual: 'BLOCK_NONE' | 'BLOCK_LOW' | 'BLOCK_MEDIUM' | 'BLOCK_HIGH';
    dangerous: 'BLOCK_NONE' | 'BLOCK_LOW' | 'BLOCK_MEDIUM' | 'BLOCK_HIGH';
  };
}

export interface MediaAttachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  media?: MediaAttachment[];
  latencyMs?: number;
  tokens?: number;
  isError?: boolean;
}

export interface SchemaProperty {
  id: string;
  name: string;
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description: string;
  required: boolean;
  itemType?: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN';
}

export interface ToolParameter {
  name: string;
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'OBJECT';
  description: string;
  required: boolean;
}

export interface CustomToolDeclaration {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  mockResponse?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Coding' | 'Reasoning' | 'Multimodal' | 'Structured Data' | 'Agent Tools' | 'Writing';
  model: string;
  systemInstruction: string;
  prompt: string;
  temperature: number;
  topP: number;
  responseMimeType?: 'text/plain' | 'application/json';
  tags: string[];
}
