// lib/ai/embedding.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Split content into chunks by sentences
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

// Generate embeddings for multiple chunks
export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks,
  });
  
  return response.data.map((item, i) => ({ 
    content: chunks[i], 
    embedding: item.embedding 
  }));
};

// Generate a single embedding for search queries
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: input,
  });
  
  return response.data[0].embedding;
};

interface SearchResult {
  content: string;
  similarity: number;
  source: string;
  page: number;
}

// Find relevant content using vector similarity
export const findRelevantContent = async (userQuery: string): Promise<SearchResult[]> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  
  // Call Supabase RPC function for vector search
  const { data, error } = await supabase.rpc('search_documents', {
    query_embedding: userQueryEmbedded,
    match_count: 5
  });

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return data.map((item: SearchResult) => ({
    content: item.content,
    similarity: item.similarity,
    source: item.source,
    page: item.page
  }));
};