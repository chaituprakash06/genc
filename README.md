# GenC - AI Dispute Negotiation Expert

GenC is an AI-powered dispute negotiation tool that helps users gain the upper hand in their contract negotiations by providing strategic advice based on game theory and negotiation tactics.

## Overview

GenC uses OpenAI's o3-mini model to analyze documents and suggest negotiation strategies. The assistant acts as a general counsel and negotiation expert, helping users identify leverage points, contradictions, and effective communication strategies.

## Setup Instructions

1. **Configure Environment Variables**:
   - Create a `.env.local` file at the root of the project (if it doesn't exist already)
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your-api-key-here
     ```

2. **Create an Assistant in OpenAI**:
   - The easiest way is to use our helper script:
     ```bash
     npm run create-assistant
     ```
   - This will create an assistant with the correct configuration and provide you with an Assistant ID
   - Add the Assistant ID to your `.env.local` file:
     ```
     OPENAI_ASSISTANT_ID=your-assistant-id-here
     ```
   
   - Alternatively, you can create it manually in the [OpenAI Platform](https://platform.openai.com/assistants):
     - Create a new Assistant using the o3 mini model
     - Configure it with the system prompt shown in `scripts/create-assistant.js`
     - Enable the file search capability
     - Copy the Assistant ID and add it to your `.env.local` file

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## User Workflow

1. **Upload Documents**: Store your contract documents in the document repository
2. **Create Project**: Enter project details and select relevant documents
3. **Verify Details**: Review information before analysis
4. **View Analysis**: AI generates a strategic analysis with clear priorities
5. **Negotiate**: Chat with the AI negotiation expert for specific advice
6. **Update**: Add updates as the negotiation progresses

## Features

- **Document Repository**: Upload and manage contract documents in a central location
- **Strategic Contract Analysis**: AI-powered analysis of contracts and disputes
- **Document Selection**: Choose from previously uploaded documents for each project
- **AI Negotiation Expert**: Chat interface with context-aware AI negotiation advice
- **Project Updates**: Track changes and add new information as negotiations progress
- **Game Theory-Based Advice**: Leverage proven negotiation tactics and strategies

## Project Structure

```
src/
├── app/
│   ├── analysis/         # Contract analysis page
│   ├── api/              # API routes
│   │   ├── assistant/    # OpenAI Assistant API endpoints
│   │   └── generate-analysis/ # Analysis generation endpoint
│   ├── create/           # Project creation page
│   ├── documents/        # Document repository page
│   ├── negotiation-chat/ # Chat with negotiation expert
│   ├── update/           # Project updates page
│   └── verify/           # Project verification page
├── components/
│   ├── documents/        # Document management components
│   ├── negotiation/      # Negotiation UI components
│   └── ui/               # UI components
└── lib/
    └── openai.ts         # OpenAI integration utilities
```

## Document Management

The document repository provides several features:
- **Upload Documents**: Store contract documents, emails, and other supporting materials
- **Document Organization**: Search, filter, and manage uploaded documents
- **Document Reuse**: Select previously uploaded documents for new projects
- **File Type Support**: Handle various document formats (PDF, Word, text, etc.)

All documents are processed by the OpenAI Assistant API and made available for AI analysis during projects and negotiation sessions.

## System Prompt

The application uses a carefully crafted system prompt for the AI assistant:

```
You are a general counsel and an expert in negotiation. Your purpose is to use the below information and documentation to advise the user on how they could gain an upper hand in future conversations with the opposing parties of their projects/encounters.

The user has provided all relevant agreements, documents and information on the project they are working on and is now seeking advice on how to gain the upper hand in their future negotiation discussions. You will use your provided vector database resources on game theory and negotiation tactics to provide bespoke, tailored advice to the user.

When analyzing the user's situation:
1. Look for leverage points in their contract or dispute
2. Identify potential contradictions or weaknesses in the opposing party's position
3. Apply negotiation theory and game theory to develop strategic recommendations
4. Provide concrete, actionable advice on what to say/not say in future conversations
5. Format your analysis with clear priorities and recommendations

Be specific and provide tactical advice, not just general principles.
```

## Technologies Used

- Next.js with App Router
- TypeScript
- OpenAI Assistant API with o3-mini model
- Tailwind CSS
