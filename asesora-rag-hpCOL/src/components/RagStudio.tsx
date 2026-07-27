import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, Trash2, Send, Database, Sparkles, BookOpen,
  Info, ShieldCheck, HelpCircle, Layers, RefreshCw, ChevronDown, ChevronUp, Code2, AlertTriangle
} from 'lucide-react';
import { DocumentFile, SourceCitation } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  sources?: SourceCitation[];
  foundInContext?: boolean;
  promptUsed?: string;
  retrievedChunksCount?: number;
}

interface RagStudioProps {
  documents: DocumentFile[];
  onUploadPdf: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onReingest: (chunkSize: number, overlap: number) => Promise<void>;
  totalChunks: number;
}

export const RagStudio: React.FC<RagStudioProps> = ({
  documents,
  onUploadPdf,
  onDeleteDocument,
  onReingest,
  totalChunks,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: '¡Hola! Soy tu Agente RAG. He procesado los documentos PDF en la base vectorial. Hazme cualquier pregunta y responderé únicamente con base en el contenido verificado de tus documentos.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      foundInContext: true,
    }
  ]);

  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chunkSize, setChunkSize] = useState(500);
  const [overlap, setOverlap] = useState(50);
  const [topK, setTopK] = useState(4);
  const [selectedPromptInspector, setSelectedPromptInspector] = useState<{
    prompt: string;
    sources: SourceCitation[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAskQuestion = async (textToAsk?: string) => {
    const q = (textToAsk || questionInput).trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];

    setMessages(newMessages);
    if (!textToAsk) setQuestionInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, top_k: topK }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || [],
          foundInContext: data.found_in_context,
          promptUsed: data.prompt_used,
          retrievedChunksCount: data.retrieved_chunks_count,
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-err-${Date.now()}`,
          sender: 'agent',
          text: `❌ Error al consultar el agente: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          foundInContext: false,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await onUploadPdf(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sampleQuestions = [
    "¿Cómo se configura la persistencia de datos en OCI Container Instances?",
    "¿Cuál es el procedimiento y plazo para solicitar reembolsos?",
    "¿Qué beneficios y fondos de capacitación existen para empleados?",
    "¿Qué es OCI Container Registry (OCIR) y cómo se realiza el login?"
  ];

  return (
    <div id="rag-studio-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: GESTOR DE DOCUMENTOS Y VECTOR DB */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Cargar PDFs */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-blue-600 rounded-none flex items-center justify-center text-white">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Documentos PDF (docs/)</h2>
                  <p className="text-[11px] text-slate-500 font-mono">ChromaDB VectorStore</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 font-bold uppercase">
                {totalChunks} Chunks
              </span>
            </div>

            {/* Subida Drag & Drop */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <button
              id="btn-upload-pdf"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-2 border-dashed border-slate-300 hover:border-blue-600 bg-slate-50 hover:bg-blue-50/50 p-4 text-center transition-all group cursor-pointer rounded-none"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-8 h-8 rounded-none bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-blue-700">
                  {isUploading ? 'Procesando PDF...' : 'Subir nuevo archivo PDF'}
                </div>
                <p className="text-[11px] text-slate-400">Arrastra tu PDF o haz clic aquí</p>
              </div>
            </button>

            {/* Lista de Documentos */}
            <div className="mt-4 space-y-2 max-h-52 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">No hay documentos PDF cargados.</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 hover:border-blue-300 transition-all rounded-none"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-2">
                          <span>{doc.totalPages} Pág</span>
                          <span>•</span>
                          <span className="text-blue-600 font-bold">{doc.chunkCount} chunks</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Eliminar documento"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ajustes de Chunking e Ingesta Vectorial */}
          <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-none">
            <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Parámetros Retrieval
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <div className="flex justify-between mb-1 font-mono text-[11px]">
                  <span>Tamaño Chunk (chars):</span>
                  <span className="text-blue-600 font-bold">{chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-mono text-[11px]">
                  <span>Solapamiento (Overlap):</span>
                  <span className="text-blue-600 font-bold">{overlap}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="10"
                  value={overlap}
                  onChange={(e) => setOverlap(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-mono text-[11px]">
                  <span>Top-K Fragmentos:</span>
                  <span className="text-blue-600 font-bold">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full accent-blue-600 bg-slate-200 h-1.5"
                />
              </div>

              <button
                id="btn-reingest"
                onClick={() => onReingest(chunkSize, overlap)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px] transition-colors border border-slate-900 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-ejecutar Ingesta Vectorial</span>
              </button>
            </div>
          </div>

          {/* Información RAG */}
          <div className="bg-blue-50/80 border border-blue-200 p-4 text-xs text-blue-900 space-y-2 rounded-none">
            <div className="flex items-center space-x-2 text-blue-800 font-bold uppercase tracking-wide text-[10px]">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Garantía Anti-Alucinación</span>
            </div>
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              El prompt del sistema obliga al modelo LLM a responder únicamente basándose en los fragmentos de contexto recuperados. Si el tema no está en los PDFs, dirá explícitamente que no cuenta con esa información.
            </p>
          </div>

        </div>

        {/* PANEL DERECHO: INTERFAZ DE CONSOLA Y CHAT RAG */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-slate-900 border border-slate-800 shadow-xl overflow-hidden rounded-none">
          
          {/* Header del Chat */}
          <div className="bg-slate-800/90 border-b border-slate-700 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-emerald-400"></div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Consola Interactiva del Agente RAG</h3>
                <p className="text-[10px] font-mono text-slate-400">Gemini 3.6 Flash | Búsqueda Similitud Coseno</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 bg-slate-950 px-2.5 py-1 border border-slate-700">
              Grounded Mode
            </span>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 text-xs leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white border-blue-500 font-medium'
                      : 'bg-slate-900 text-slate-100 border-slate-800 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Badges de respuesta RAG */}
                  {msg.sender === 'agent' && msg.foundInContext !== undefined && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                      {msg.foundInContext ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5" /> Basado en documentos ({msg.retrievedChunksCount || msg.sources?.length || 0} fragmentos)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" /> No encontrado en documentos
                        </span>
                      )}

                      {msg.promptUsed && (
                        <button
                          onClick={() =>
                            setSelectedPromptInspector({
                              prompt: msg.promptUsed || '',
                              sources: msg.sources || []
                            })
                          }
                          className="text-[10px] text-blue-400 hover:text-blue-300 uppercase font-bold flex items-center gap-1 underline"
                        >
                          <Code2 className="w-3 h-3" /> Ver Prompt & Contexto
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Citas y Fuentes si existen */}
                {msg.sender === 'agent' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 max-w-2xl w-full bg-slate-900 border border-slate-800 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Fuentes citadas ({msg.sources.length}):
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 p-2.5 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-blue-400 font-bold">
                            <span className="truncate">{src.documentName}</span>
                            <span className="text-[10px] bg-blue-900/40 px-1.5 py-0.5 text-blue-300 font-mono">
                              Pág. {src.pageNumber}
                            </span>
                          </div>
                          <p className="text-slate-400 line-clamp-2 text-[10px] italic">
                            "{src.chunkText}"
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono flex justify-between pt-0.5">
                            <span>Similitud:</span>
                            <span className="text-emerald-400 font-bold">
                              {Math.round(src.similarityScore * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start space-y-2">
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-slate-300 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 animate-ping"></div>
                  <span className="font-mono text-xs text-blue-400">Generando respuesta con Gemini 3.6 Flash...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Preguntas sugeridas de prueba:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {sampleQuestions.map((qText, index) => (
                <button
                  key={index}
                  onClick={() => handleAskQuestion(qText)}
                  className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 border border-slate-800 transition-colors text-left font-sans"
                >
                  {qText}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de Entrada de Texto */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3">
            <input
              id="input-question"
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Escribe tu pregunta sobre los documentos PDF aquí..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 px-4 py-2.5 text-xs font-sans text-slate-100 placeholder-slate-500 outline-none transition-all rounded-none"
            />
            <button
              id="btn-send-question"
              onClick={() => handleAskQuestion()}
              disabled={isLoading || !questionInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs px-4 py-2.5 transition-all flex items-center justify-center cursor-pointer rounded-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* MODAL: INSPECTOR DE PROMPT & CONTEXTO */}
      {selectedPromptInspector && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl rounded-none">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
                <Code2 className="w-4 h-4" />
                <span>Inspector del Prompt del Sistema & Fragmentos</span>
              </div>
              <button
                onClick={() => setSelectedPromptInspector(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 uppercase font-bold"
              >
                Cerrar ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs text-slate-300">
              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">PROMPT ENVIADO AL MODELO:</h4>
                <pre className="bg-slate-950 border border-slate-800 p-4 whitespace-pre-wrap text-[11px] text-emerald-300 leading-relaxed">
                  {selectedPromptInspector.prompt}
                </pre>
              </div>

              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  FUENTES & SIMILITUD COSENO (TOP-K):
                </h4>
                <div className="space-y-2">
                  {selectedPromptInspector.sources.map((s, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3 text-[11px]">
                      <div className="text-blue-400 font-bold">
                        [{idx + 1}] Documento: {s.documentName} (Pág. {s.pageNumber})
                      </div>
                      <p className="text-slate-300 mt-1">{s.chunkText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
