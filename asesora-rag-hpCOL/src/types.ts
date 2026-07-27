export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  totalPages: number;
  chunkCount: number;
  status: 'indexed' | 'processing' | 'error';
  content?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  text: string;
  embeddingPreview?: number[];
  similarityScore?: number;
}

export interface SourceCitation {
  documentName: string;
  pageNumber: number;
  chunkText: string;
  similarityScore: number;
}

export interface RagAskRequest {
  question: string;
  top_k?: number;
  similarity_threshold?: number;
}

export interface RagAskResponse {
  answer: string;
  sources: SourceCitation[];
  found_in_context: boolean;
  prompt_used?: string;
  retrieved_chunks_count: number;
}

export interface PythonFile {
  filename: string;
  phase: string;
  title: string;
  description: string;
  code: string;
}
