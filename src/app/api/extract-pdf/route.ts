// app/api/extract-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // For now, return empty text since pdf-parse requires additional setup
    // You'll need to install: npm install pdf-parse @types/pdf-parse
    // Then uncomment the code below:
    
    /*
    const pdfParse = (await import('pdf-parse')).default
    const buffer = await file.arrayBuffer()
    const data = await pdfParse(Buffer.from(buffer))
    return NextResponse.json({ text: data.text })
    */
    
    // Temporary: just return the filename for basic functionality
    return NextResponse.json({ 
      text: `PDF content from ${file.name} would be extracted here` 
    })
  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 })
  }
}