import React, { useState } from 'react';
import { Terminal, Send, Copy, Check, Play, RefreshCw, Layers } from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'ask' | 'documents' | 'ingest' | 'health'>('ask');
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({ question: '¿Cuál es la política de reembolsos y garantía?', top_k: 4 }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string>('// Presiona "Ejecutar Petición" para probar la API');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleEndpointChange = (endpoint: 'ask' | 'documents' | 'ingest' | 'health') => {
    setSelectedEndpoint(endpoint);
    if (endpoint === 'ask') {
      setRequestBody(JSON.stringify({ question: '¿Cuál es la política de reembolsos y garantía?', top_k: 4 }, null, 2));
    } else if (endpoint === 'ingest') {
      setRequestBody(JSON.stringify({ chunkSize: 500, overlap: 50, resetToDefaults: false }, null, 2));
    } else {
      setRequestBody('');
    }
  };

  const executeApiCall = async () => {
    setIsLoading(true);
    setResponseOutput('Cargando respuesta...');
    setResponseStatus(null);

    try {
      let url = '/api/rag/ask';
      let method = 'POST';

      if (selectedEndpoint === 'documents') {
        url = '/api/rag/documents';
        method = 'GET';
      } else if (selectedEndpoint === 'ingest') {
        url = '/api/rag/ingest';
        method = 'POST';
      } else if (selectedEndpoint === 'health') {
        url = '/api/rag/health';
        method = 'GET';
      }

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (method === 'POST' && requestBody.trim()) {
        options.body = requestBody;
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const endTime = performance.now();

      setResponseStatus(res.status);
      const data = await res.json();

      setResponseOutput(
        `// HTTP ${res.status} ${res.statusText} (${Math.round(endTime - startTime)}ms)\n\n` +
        JSON.stringify(data, null, 2)
      );
    } catch (err: any) {
      setResponseOutput(`// Error de conexión: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurlSnippet = () => {
    const origin = window.location.origin;
    if (selectedEndpoint === 'ask') {
      return `curl -X POST "${origin}/api/rag/ask" \\
     -H "Content-Type: application/json" \\
     -d '${requestBody.replace(/\n/g, '')}'`;
    } else if (selectedEndpoint === 'ingest') {
      return `curl -X POST "${origin}/api/rag/ingest" \\
     -H "Content-Type: application/json" \\
     -d '${requestBody.replace(/\n/g, '')}'`;
    } else if (selectedEndpoint === 'documents') {
      return `curl -X GET "${origin}/api/rag/documents"`;
    } else {
      return `curl -X GET "${origin}/api/rag/health"`;
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(generateCurlSnippet());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div id="api-playground-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-slate-200 p-6 shadow-sm mb-6 rounded-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center text-white">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Probador de API REST en Vivo</h2>
            <p className="text-[11px] font-mono text-slate-500">FastAPI & Express RAG Endpoints</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO: PETICIÓN JSON */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4 rounded-none">
            
            {/* Selección de Endpoint */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Endpoint REST:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEndpointChange('ask')}
                  className={`px-3 py-2 text-xs font-mono font-bold border text-left transition-colors cursor-pointer rounded-none ${
                    selectedEndpoint === 'ask'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-emerald-500 font-bold mr-1.5">POST</span> /ask
                </button>

                <button
                  onClick={() => handleEndpointChange('documents')}
                  className={`px-3 py-2 text-xs font-mono font-bold border text-left transition-colors cursor-pointer rounded-none ${
                    selectedEndpoint === 'documents'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-blue-500 font-bold mr-1.5">GET</span> /documents
                </button>

                <button
                  onClick={() => handleEndpointChange('ingest')}
                  className={`px-3 py-2 text-xs font-mono font-bold border text-left transition-colors cursor-pointer rounded-none ${
                    selectedEndpoint === 'ingest'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-emerald-500 font-bold mr-1.5">POST</span> /ingest
                </button>

                <button
                  onClick={() => handleEndpointChange('health')}
                  className={`px-3 py-2 text-xs font-mono font-bold border text-left transition-colors cursor-pointer rounded-none ${
                    selectedEndpoint === 'health'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-blue-500 font-bold mr-1.5">GET</span> /health
                </button>
              </div>
            </div>

            {/* Request Body JSON */}
            {selectedEndpoint !== 'documents' && selectedEndpoint !== 'health' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payload Request (JSON):</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-none p-3 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Botón Ejecutar */}
            <button
              onClick={executeApiCall}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 rounded-none"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'Ejecutando Petición...' : 'Ejecutar Petición REST'}</span>
            </button>

            {/* cURL Snippet */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                <span>Comando cURL generado:</span>
                <button
                  onClick={copyCurl}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurl ? '¡Copiado!' : 'Copiar cURL'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 p-3 rounded-none font-mono text-[11px] text-blue-300 overflow-x-auto whitespace-pre">
                {generateCurlSnippet()}
              </pre>
            </div>

          </div>
        </div>

        {/* PANEL DERECHO: RESPUESTA JSON */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-none p-5 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Respuesta Servidor (JSON Response):</span>
            {responseStatus && (
              <span className={`px-2 py-0.5 text-xs font-mono font-bold ${
                responseStatus >= 200 && responseStatus < 300
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                HTTP {responseStatus}
              </span>
            )}
          </div>

          <pre className="flex-1 bg-slate-950 border border-slate-800 rounded-none p-4 font-mono text-xs text-emerald-400 overflow-auto whitespace-pre leading-relaxed">
            {responseOutput}
          </pre>
        </div>
      </div>
    </div>
  );
};
