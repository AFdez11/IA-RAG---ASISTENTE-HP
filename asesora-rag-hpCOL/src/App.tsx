import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { PdfModal } from './components/PdfModal';
import { DocumentFile } from './types';

export default function App() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/rag/documents');
      if (res.ok) {
        const docs: DocumentFile[] = await res.json();
        setDocuments(docs);
      }
    } catch (e) {
      console.error('Error al verificar documentos:', e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header with PDF Viewer Modal Trigger */}
      <Header onOpenPdfModal={() => setIsPdfModalOpen(true)} />

      {/* Main Content: Focused Chat Interface */}
      <main className="flex-1 flex flex-col">
        <ChatView documents={documents} />
      </main>

      {/* PDF Viewer Modal */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex justify-center">
          <div>
            Canal Oficial de Atención al Cliente e Información de Catálogo
          </div>
        </div>
      </footer>
    </div>
  );
}
