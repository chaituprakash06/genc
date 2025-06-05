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

interface SearchKnowledgeResult {
  success: boolean;
  results: any[];
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
  } catch (error: any) {
    console.error('Error adding knowledge:', error);
    return { success: false, error: error.message };
  }
};

export const searchKnowledge = async (query: string, limit: number = 5): Promise<SearchKnowledgeResult> => {
  try {
    const results = await findRelevantContent(query);
    return { success: true, results };
  } catch (error: any) {
    console.error('Error searching knowledge:', error);
    return { success: false, error: error.message, results: [] };
  }
};