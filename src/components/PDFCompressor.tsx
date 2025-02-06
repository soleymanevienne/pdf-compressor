// src/components/PDFCompressor.tsx
import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompressionStatus {
  type: 'error' | 'success';
  message: string;
}

interface CompressedFileInfo {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
}

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<CompressedFileInfo | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<CompressionStatus | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setCompressionStatus({
          type: 'error',
          message: 'Le fichier ne doit pas dépasser 10MB'
        });
        return;
      }
      setFile(selectedFile);
      setCompressedFile(null);
      setCompressionStatus(null);
    } else {
      setCompressionStatus({
        type: 'error',
        message: 'Veuillez sélectionner un fichier PDF valide'
      });
    }
  };

  const compressPDF = async () => {
    if (!file) return;

    setIsCompressing(true);
    setCompressionStatus(null);

    try {
      // Convertir le fichier en base64
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = async () => {
        try {
          const base64String = fileReader.result as string;

          const response = await fetch('/api/compress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdfBase64: base64String,
            }),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la compression');
          }

          const data = await response.json();
          
          // Créer un Blob à partir du PDF compressé
          const blobData = await fetch(data.compressedPdf).then(r => r.blob());
          const compressedUrl = URL.createObjectURL(blobData);

          setCompressedFile({
            name: `compressed_${file.name}`,
            originalSize: data.originalSize,
            compressedSize: data.compressedSize,
            url: compressedUrl,
          });

          const reductionPercentage = Math.round(
            ((data.originalSize - data.compressedSize) / data.originalSize) * 100
          );

          setCompressionStatus({
            type: 'success',
            message: `Compression réussie ! Taille réduite de ${reductionPercentage}%`
          });
        } catch (error) {
          console.error('Erreur de compression:', error);
          setCompressionStatus({
            type: 'error',
            message: 'Erreur lors de la compression du PDF'
          });
        }
      };

      fileReader.onerror = () => {
        setCompressionStatus({
          type: 'error',
          message: 'Erreur lors de la lecture du fichier'
        });
      };

    } catch (error) {
      console.error('Erreur:', error);
      setCompressionStatus({
        type: 'error',
        message: 'Erreur lors de la compression'
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedFile) {
      const link = document.createElement('a');
      link.href = compressedFile.url;
      link.download = compressedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Compresseur PDF
          </h1>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm text-gray-600">
              Cliquez pour sélectionner un PDF
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Max. 10MB
            </span>
          </label>
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Fichier sélectionné :</h3>
            <p className="text-sm text-gray-600">Nom : {file.name}</p>
            <p className="text-sm text-gray-600">
              Taille : {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {compressedFile && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2">Fichier compressé :</h3>
            <p className="text-sm text-gray-600">
              Nouvelle taille : {(compressedFile.compressedSize / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={handleDownload}
              className="mt-3 flex items-center justify-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </button>
          </div>
        )}

        {file && !isCompressing && !compressedFile && (
          <button
            onClick={compressPDF}
            className="w-full py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Compresser
          </button>
        )}

        {isCompressing && (
          <div className="w-full py-3 rounded-lg font-medium text-gray-600 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2" />
            Compression en cours...
          </div>
        )}

        {compressionStatus && (
          <Alert className={`mt-4 ${
            compressionStatus.type === 'error' ? 'bg-red-50' : 'bg-green-50'
          }`}>
            {compressionStatus.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={`
              ${compressionStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}
            `}>
              {compressionStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}