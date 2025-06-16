// app/api/extract-doc/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // For now, return empty text since mammoth requires additional setup
    // You'll need to install: npm install mammoth
    // Then uncomment the code below:
    
    /*
    const mammoth = await import('mammoth')
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return NextResponse.json({ text: result.value })
    */
    
    // Temporary: just return the filename for basic functionality
    return NextResponse.json({ 
      text: `DOC content from ${file.name} would be extracted here` 
    })
  } catch (error) {
    console.error('DOC extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract DOC text' }, { status: 500 })
  }
}