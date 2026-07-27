import React, { useState } from 'react';
import { X, FileText, Download, Printer, Search, ChevronLeft, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { INITIAL_SAMPLE_DOCS } from '../data/defaultDocuments';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfModal: React.FC<PdfModalProps> = ({ isOpen, onClose }) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const doc = INITIAL_SAMPLE_DOCS[selectedDocIndex] || INITIAL_SAMPLE_DOCS[0];
  const totalPages = doc.totalPages;

  // Split content into pages
  const pageBlocks = doc.content.split(/\[Página \d+\]/).filter((block) => block.trim().length > 0);

  const handleSelectDoc = (index: number) => {
    setSelectedDocIndex(index);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleDownloadPdf = () => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.replace('.pdf', '') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePageText = pageBlocks[currentPage - 1] || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Toolbar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white font-mono text-xs">
              PDF
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Documentación Oficial HP Colombia
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-blue-400 inline" />
                2 Documentos Oficiales en Contexto
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              title="Descargar documento actual"
              className="text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
            <button
              onClick={() => window.print()}
              title="Imprimir documento"
              className="text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Selector Tabs */}
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700 overflow-x-auto text-xs">
          {INITIAL_SAMPLE_DOCS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelectDoc(idx)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedDocIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{idx === 0 ? 'Catálogo & Políticas HP' : 'Términos & Condiciones HP'}</span>
              <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded font-mono">
                {item.totalPages} pág.
              </span>
            </button>
          ))}
        </div>

        {/* Viewer Sub-bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Page Selector */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-800">
              Página <span className="text-blue-700">{currentPage}</span> de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Jump Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  currentPage === p
                    ? 'bg-blue-700 text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Pág. {p}
              </button>
            ))}
          </div>

          {/* Filter Search inside PDF */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Buscar en el documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 w-48"
            />
          </div>
        </div>

        {/* PDF Page Body Viewer */}
        <div className="flex-1 bg-slate-200/80 p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div className="bg-white border border-slate-300 rounded-lg shadow-md max-w-2xl w-full p-6 sm:p-10 font-sans text-slate-800 leading-relaxed min-h-[500px]">
            {/* Header section on document page */}
            <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">
                  HEWLETT-PACKARD COLOMBIA S.A.S.
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {doc.name.replace('.pdf', '').replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-mono font-semibold">
                PÁGINA {currentPage} DE {totalPages}
              </div>
            </div>

            {/* Content of current page with search highlight */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {searchTerm.trim().length > 0 ? (
                <div>
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg text-xs mb-4 font-medium">
                    Resultados de búsqueda para "{searchTerm}":
                  </div>
                  {doc.content
                    .split('\n')
                    .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((matchingLine, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg my-1 text-xs font-mono">
                        {matchingLine}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="font-sans space-y-3">
                  {activePageText.trim().split('\n').map((line, idx) => {
                    if (
                      line.startsWith('1.') ||
                      line.startsWith('2.') ||
                      line.startsWith('3.') ||
                      line.startsWith('4.') ||
                      line.startsWith('5.') ||
                      line.startsWith('6.') ||
                      line.startsWith('7.') ||
                      line.startsWith('8.') ||
                      line.startsWith('9.')
                    ) {
                      return (
                        <h4 key={idx} className="text-sm font-bold text-blue-900 mt-4 border-b border-slate-100 pb-1">
                          {line}
                        </h4>
                      );
                    }
                    if (line.startsWith('-')) {
                      return (
                        <div key={idx} className="pl-3 border-l-2 border-blue-600 my-1 py-0.5 text-slate-700">
                          {line}
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              )}
            </div>

            {/* Document Footer stamp */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Documentación Oficial Verificada
              </span>
              <span>Tienda Oficial HP.com Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
