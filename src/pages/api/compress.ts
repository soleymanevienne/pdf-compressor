// src/pages/api/compress.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument } from 'pdf-lib'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { pdfBase64 } = req.body

    if (!pdfBase64) {
      return res.status(400).json({ message: 'No PDF data provided' })
    }

    // Decode base64
    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64')

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    // Compress the PDF
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    })

    // Convert back to base64
    const compressedBase64 = Buffer.from(compressedPdfBytes).toString('base64')

    res.status(200).json({
      compressedPdf: `data:application/pdf;base64,${compressedBase64}`,
      originalSize: pdfBuffer.length,
      compressedSize: compressedPdfBytes.length,
    })
  } catch (error) {
    console.error('PDF compression error:', error)
    res.status(500).json({ message: 'Error compressing PDF' })
  }
}
