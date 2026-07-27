import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, FilePlus, RefreshCw, HardDrive, Layers } from 'lucide-react';
import { DocumentFile } from '../types';

interface DocumentsViewProps {
  documents: DocumentFile[];
  onUploadPdf: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onReingest: (chunkSize: number, overlap: number) => Promise<void>;
  onNavigateToChat: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUploadPdf,
  onDeleteDocument,
  onReingest,
  onNavigateToChat,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('Por favor selecciona un archivo en formato PDF.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await onUploadPdf(file);
      setSuccessMsg(`Documento "${file.name}" subido e indexado correctamente.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al subir el archivo PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            Catálogos y Documentos PDF
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sube aquí tus documentos PDF (catálogos, fichas técnicas, listas de precios). Gigi indexará el contenido para asesorarte en el Chat.
          </p>
        </div>
        {documents.length > 0 && (
          <button
            onClick={onNavigateToChat}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Ir al Chat con IA →
          </button>
        )}
      </div>

      {/* Alertas de Mensaje */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Área de Carga Drag & Drop */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50'
            : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {isUploading ? 'Procesando archivo PDF...' : 'Haz clic o arrastra un archivo PDF aquí'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Soporta cualquier archivo PDF (Manuales, Políticas, Reportes, Contratos)</p>
          </div>
          <button
            type="button"
            disabled={isUploading}
            className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Procesando...' : 'Seleccionar Documento'}</span>
          </button>
        </div>
      </div>

      {/* Lista de Documentos Cargados */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">
            Archivos Indexados ({documents.length})
          </h3>
          <span className="text-xs font-medium text-slate-500">
            Total fragmentos: {documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)}
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Aún no has subido ningún documento. Sube un archivo PDF arriba para empezar.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">{doc.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span>{doc.totalPages} Pág.</span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">{doc.chunkCount} fragmentos indexados</span>
                      {doc.uploadDate && (
                        <>
                          <span>•</span>
                          <span>{doc.uploadDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Listo
                  </span>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    title="Eliminar archivo"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
