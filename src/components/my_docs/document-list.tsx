// components/documents/document-list.tsx
'use client'

import { Document } from '@/app/project/my_docs/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DocumentListProps {
  documents: Document[]
  onDelete: (id: string) => void
}

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return '📄'
    } else if (type.includes('doc')) {
      return '📝'
    } else if (type.includes('text')) {
      return '📃'
    }
    return '📎'
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No documents uploaded yet. Upload your contracts to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <span className="text-2xl">{getFileIcon(doc.type)}</span>
            <div>
              <h4 className="font-medium">{doc.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {doc.size} • Uploaded {doc.uploadedAt.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(doc.status)}>
              {doc.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(doc.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
