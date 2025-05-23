// src/lib/openai.ts
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID from environment variables
const assistantId = process.env.OPENAI_ASSISTANT_ID;

/**
 * Create a new thread for a user interaction
 */
export async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread;
}

/**
 * Add a message to an existing thread
 */
export async function addMessageToThread(threadId: string, content: string, fileIds?: string[]) {
  const messageData: OpenAI.Beta.Threads.MessageCreateParams = {
    role: 'user',
    content,
  };

  // Add file_ids if provided (API v2 format)
  if (fileIds && fileIds.length > 0) {
    messageData.attachments = fileIds.map(file_id => ({
      file_id,
      tools: [{ type: 'file_search' as const }]
    }));
  }

  const message = await openai.beta.threads.messages.create(threadId, messageData);
  return message;
}

/**
 * Run the assistant on a thread and wait for completion
 */
export async function runAssistant(threadId: string, systemPrompt?: string) {
  if (!assistantId) {
    throw new Error('Assistant ID is not configured in environment variables');
  }

  // Create a run with options
  const runOptions: OpenAI.Beta.Threads.RunCreateParams = {
    assistant_id: assistantId,
  };
  
  // Add system prompt if provided
  if (systemPrompt) {
    runOptions.additional_instructions = systemPrompt;
  }
  
  const run = await openai.beta.threads.runs.create(threadId, runOptions);

  // Poll for the run to complete
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  
  // Simple polling mechanism - in production, you might want to use webhooks instead
  while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
    // Wait for 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  if (runStatus.status === 'completed') {
    // Get the messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    return {
      status: runStatus.status,
      messages: messages.data,
    };
  } else {
    // Handle errors or incomplete runs
    return {
      status: runStatus.status,
      error: runStatus.last_error,
    };
  }
}

/**
 * Upload a file to OpenAI for use with assistants
 */
export async function uploadFile(file: Buffer | Blob | File, fileName: string) {
  // Use OpenAI's toFile helper to ensure proper type
  const fileToUpload = await toFile(file, fileName);

  const uploadedFile = await openai.files.create({
    file: fileToUpload,
    purpose: 'assistants',
  });
  return uploadedFile;
}

/**
 * Delete a file from OpenAI
 */
export async function deleteFile(fileId: string) {
  await openai.files.del(fileId);
}

/**
 * Get all files
 */
export async function listFiles() {
  const files = await openai.files.list({
    purpose: 'assistants'
  });
  return files.data;
}

/**
 * Get assistant details
 */
export async function getAssistant() {
  if (!assistantId) {
    throw new Error('Assistant ID is not configured in environment variables');
  }
  
  const assistant = await openai.beta.assistants.retrieve(assistantId);
  return assistant;
}

/**
 * Update assistant with file IDs
 * Note: In the latest OpenAI API, files are attached to messages, not assistants
 */
export async function updateAssistantFiles(fileIds: string[]) {
  if (!assistantId) {
    throw new Error('Assistant ID is not configured in environment variables');
  }
  
  // In the new API, files are attached to messages rather than assistants
  // Return the assistant details instead
  const assistant = await openai.beta.assistants.retrieve(assistantId);
  return assistant;
}