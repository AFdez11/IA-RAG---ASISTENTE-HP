import React, { useState } from 'react';
import { PYTHON_FILES } from '../data/pythonCode';
import { Copy, Check, Download, FileCode, Terminal, BookOpen, Layers } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFilename, setSelectedFilename] = useState<string>('ingest.py');
  const [copied, setCopied] = useState(false);

  const selectedFile = PYTHON_FILES.find((f) => f.filename === selectedFilename) || PYTHON_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="code-viewer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: SELECCIÓN DE ARCHIVO POR FASES */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 bg-blue-600 rounded-none flex items-center justify-center text-white">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Estructura del Proyecto Python</h2>
                <p className="text-[11px] font-mono text-slate-500">Entregables Fases 1 a 4</p>
              </div>
            </div>

            <div className="space-y-2">
              {PYTHON_FILES.map((file, idx) => {
                const isSelected = file.filename === selectedFilename;
                return (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFilename(file.filename)}
                    className={`w-full text-left p-3 border transition-all flex items-center justify-between cursor-pointer rounded-none ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className="opacity-60 italic font-mono text-[11px] shrink-0">0{idx + 1}.</span>
                      <div className="truncate">
                        <div className="text-xs font-mono font-bold truncate">{file.filename}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{file.title}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none shrink-0 ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {file.phase}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Información de la Fase Seleccionada */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none text-xs space-y-3">
            <div className="flex items-center space-x-2 text-blue-600 font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-4 h-4" />
              <span>{selectedFile.phase}: {selectedFile.title}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              {selectedFile.description}
            </p>
          </div>
        </div>

        {/* PANEL DERECHO: VISOR DE CÓDIGO CON SINTAXIS */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px] rounded-none">
          
          {/* Header del Código */}
          <div className="bg-slate-800 border-b border-slate-700 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 bg-blue-500"></span>
              <span className="text-white font-bold uppercase tracking-wider ml-1">{selectedFile.filename}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer rounded-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>

          {/* Área de Código Fuente */}
          <div className="flex-1 overflow-auto p-5 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 selection:bg-blue-600 selection:text-white">
            <pre className="whitespace-pre">{selectedFile.code}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
