
// src/pages/index.tsx
import PDFCompressor from '@/components/PDFCompressor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PDFCompressor />
    </main>
  )
}