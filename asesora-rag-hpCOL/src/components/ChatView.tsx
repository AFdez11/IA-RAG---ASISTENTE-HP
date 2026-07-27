import React, { useState, useRef, useEffect } from 'react';
import { Send, User, BookOpen, Loader2, ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react';
import Markdown from 'react-markdown';
import { DocumentFile } from '../types';
import gigiAvatar from '../assets/images/gigi_avatar_1785130830651.jpg';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  sources?: Array<{
    documentName: string;
    pageNumber: number;
    chunkText: string;
    similarityScore: number;
  }>;
}

interface ChatViewProps {
  documents: DocumentFile[];
}

const STORAGE_KEY = 'hp_colombia_gigi_chat_v4';

const INITIAL_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'agent',
  text: 'Bienvenido al canal oficial de atención e información de HP Colombia. Soy Gigi, su asesora corporativa.\n\nTengo acceso exclusivo a la documentación oficial en PDF de HP Colombia:\n1. **Catálogo Oficial de Productos y Políticas**\n2. **Términos y Condiciones de la Tienda Virtual**\n\nPuedo orientarle sobre nuestro catálogo de equipos (Spectre, Envy, OMEN, Smart Tank, LaserJet), garantía legal de 1 a 3 años, derecho de retracto, tiempos de despacho, facturación electrónica DIAN o pasarelas de pago.\n\n¿En qué puedo colaborar con usted hoy?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const getDynamicSuggestions = (messages: Message[]): string[] => {
  if (!messages || messages.length <= 1) {
    return [
      '¿Cuáles son las laptops HP Spectre, Envy y OMEN disponibles?',
      '¿Cómo funciona la política de reembolso y devoluciones en Colombia?',
      '¿Cuáles son los tiempos de entrega y condiciones de envío gratis?',
      '¿Qué rendimiento y especificaciones tienen las impresoras HP Smart Tank?',
    ];
  }

  const lastMsg = messages[messages.length - 1];
  const lastText = (lastMsg?.text || '').toLowerCase();

  if (lastText.includes('reembolso') || lastText.includes('devolucion') || lastText.includes('devolución') || lastText.includes('retracto')) {
    return [
      '¿Cuáles son los plazos para ejercer el derecho de retracto?',
      '¿En cuántos días hábiles se realiza el desembolso por devolución?',
      '¿Qué garantía cubre defectos de fábrica en los primeros 30 días?',
    ];
  }

  if (lastText.includes('envío') || lastText.includes('entrega') || lastText.includes('bogotá') || lastText.includes('medellín') || lastText.includes('cobertura')) {
    return [
      '¿A partir de qué monto aplica el envío gratuito?',
      '¿Cuáles son los métodos de pago aceptados en Colombia?',
      '¿Cómo se emite la factura electrónica con validación DIAN?',
    ];
  }

  if (lastText.includes('laptop') || lastText.includes('spectre') || lastText.includes('envy') || lastText.includes('omen') || lastText.includes('pavilion')) {
    return [
      '¿Qué especificaciones de seguridad (HP Wolf Security) incluyen?',
      '¿Qué procesadores y tarjetas gráficas integran las laptops OMEN?',
      '¿Cuáles son las impresoras disponibles para oficina o empresa?',
    ];
  }

  if (lastText.includes('impresora') || lastText.includes('smart tank') || lastText.includes('laserjet')) {
    return [
      '¿Cuántas páginas rinden las botellas de tinta de la HP Smart Tank?',
      '¿Cuáles son las características de las impresoras HP LaserJet Pro?',
      '¿Qué garantía oficial directa se otorga en Colombia?',
    ];
  }

  return [
    '¿Cómo aplica la política de protección de datos de la Ley 1581 de 2012?',
    '¿Qué opciones de financiamiento a plazos están disponibles?',
    '¿Cuáles son los centros de servicio técnico autorizados en Colombia?',
  ];
};

export const ChatView: React.FC<ChatViewProps> = ({ documents }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error al cargar historial de chat:', e);
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error al guardar historial:', e);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleSources = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadTranscript = () => {
    const text = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'Cliente' : 'Gigi (HP Colombia)'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcripcion_HP_Colombia_Gigi_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    const newWelcome: Message = {
      id: `welcome-${Date.now()}`,
      sender: 'agent',
      text: 'Bienvenido al canal oficial de atención e información de HP Colombia. Soy Gigi, su asesora corporativa.\n\nTengo acceso exclusivo a la documentación oficial en PDF de HP Colombia:\n1. **Catálogo Oficial de Productos y Políticas**\n2. **Términos y Condiciones de la Tienda Virtual**\n\nPuedo orientarle sobre nuestro catálogo de equipos (Spectre, Envy, OMEN, Smart Tank, LaserJet), garantía legal de 1 a 3 años, derecho de retracto, tiempos de despacho, facturación electrónica DIAN o pasarelas de pago.\n\n¿En qué puedo colaborar con usted hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([newWelcome]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newWelcome]));
    } catch (e) {
      console.error('Error al reiniciar chat:', e);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim() || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), top_k: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        const agentMsgId = `agent-${Date.now()}`;
        const agentMessage: Message = {
          id: agentMsgId,
          sender: 'agent',
          text: data.answer || 'No se obtuvo una respuesta en el servidor.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error('Error en el servidor al procesar la consulta.');
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Ocurrió un inconveniente de conexión al procesar su solicitud. Por favor, intente nuevamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicSuggestions = getDynamicSuggestions(messages);

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-4 flex flex-col flex-1 h-[calc(100vh-6rem)]">
      {/* Botones de acción del Chat */}
      <div className="flex justify-end items-center mb-2 space-x-2">
        <button
          onClick={handleDownloadTranscript}
          title="Guardar transcripción de la conversación"
          className="text-xs text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Guardar Transcripción</span>
        </button>

        <button
          onClick={handleClearHistory}
          title="Reiniciar conversación"
          className="text-xs text-slate-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Reiniciar Chat</span>
        </button>
      </div>

      {/* Ventana Principal de Conversación */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col overflow-hidden">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <img
                  src={gigiAvatar}
                  alt="Gigi"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600 shrink-0 mt-0.5 shadow-2xs"
                />
              )}

              <div className={`max-w-[88%] sm:max-w-[78%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-700 text-white rounded-tr-none font-normal'
                      : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="markdown-body text-slate-800 space-y-1">
                      <Markdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                        }}
                      >
                        {msg.text}
                      </Markdown>
                    </div>
                  )}
                </div>

                {/* Fuentes Citas */}
                {msg.sender === 'agent' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1.5 text-xs">
                    <button
                      onClick={() => toggleSources(msg.id)}
                      className="text-slate-600 hover:text-blue-700 flex items-center gap-1.5 font-medium transition-colors py-0.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{msg.sources.length} referencia(s) del catálogo</span>
                      {expandedSources[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedSources[msg.id] && (
                      <div className="mt-2 space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        {msg.sources.map((src, idx) => (
                          <div key={idx} className="border-b border-slate-200/80 pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between font-semibold text-slate-800 text-[11px]">
                              <span>Documento: {src.documentName}</span>
                              <span className="text-blue-700 font-mono">Página {src.pageNumber}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 bg-white p-2 rounded border border-slate-200">
                              "{src.chunkText}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] text-slate-400 mt-1 px-1 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Estado de Carga / Consulta */}
          {isLoading && (
            <div className="flex space-x-3 items-start">
              <img
                src={gigiAvatar}
                alt="Gigi"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-600 shrink-0 shadow-2xs animate-pulse"
              />
              <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-xl rounded-tl-none text-xs flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Gigi está consultando el catálogo oficial de HP Colombia...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas de Seguimiento Dinámicas */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center justify-between">
            <span>Consultas sugeridas de seguimiento:</span>
            <span className="text-[10px] text-slate-400 font-normal">Adaptadas al catálogo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dynamicSuggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer text-left shadow-2xs hover:border-blue-300 disabled:opacity-50 font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input de Pregunta */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba su consulta sobre productos, garantías o envíos de HP Colombia..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-2xs flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 mr-1 sm:mr-0" />
              <span className="hidden sm:inline text-xs ml-1">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
