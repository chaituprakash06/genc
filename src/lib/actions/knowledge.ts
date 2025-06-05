// lib/actions/knowledge.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { generateEmbeddings, findRelevantContent } from '@/lib/ai/embedding';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface KnowledgeEntry {
  content: string;
  source?: string;
  category?: string;
}

interface AddKnowledgeResult {
  success: boolean;
  documentId?: string;
  chunks?: number;
  error?: string;
}

interface SearchResult {
  content: string;
  similarity: number;
  source: string;
  page: number;
}

interface SearchKnowledgeResult {
  success: boolean;
  results: SearchResult[];
  error?: string;
}

export const addKnowledge = async (entry: KnowledgeEntry): Promise<AddKnowledgeResult> => {
  try {
    // Create a document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        title: entry.source || 'User Knowledge',
        filename: `knowledge_${Date.now()}.txt`,
        storage_path: null
      })
      .select()
      .single();

    if (docError) throw docError;

    // Generate embeddings for the content
    const embeddings = await generateEmbeddings(entry.content);

    // Insert chunks with embeddings
    const chunks = embeddings.map((e, idx) => ({
      document_id: doc.id,
      content: e.content,
      page_number: idx + 1,
      embedding: e.embedding
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunks);

    if (chunkError) throw chunkError;

    return { success: true, documentId: doc.id, chunks: chunks.length };
  } catch (error: unknown) {
    console.error('Error adding knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

export const searchKnowledge = async (query: string): Promise<SearchKnowledgeResult> => {
  try {
    const results = await findRelevantContent(query);
    return { success: true, results };
  } catch (error: unknown) {
    console.error('Error searching knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage, results: [] };
  }
};