import React from 'react';
import { ShieldCheck, FileText, Eye } from 'lucide-react';
import gigiAvatar from '../assets/images/gigi_avatar_1785130830651.jpg';

interface HeaderProps {
  onOpenPdfModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPdfModal }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 text-slate-900 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Gigi Avatar and Identity */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={gigiAvatar}
                alt="Gigi - Asesora HP Colombia"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-slate-900">Gigi • Asesora HP Colombia</h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verificado HP
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Atención al cliente e información oficial de catálogo y políticas</p>
            </div>
          </div>

          {/* Top Right: View PDF Catalog Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenPdfModal}
              className="bg-blue-700 hover:bg-blue-800 text-white border border-blue-800 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Ver Documentos PDF (2)</span>
              <Eye className="w-3.5 h-3.5 text-blue-200 hidden sm:inline" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
