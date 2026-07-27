import express, { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SAMPLE_DOCS } from './src/data/defaultDocuments';

const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule as any).default || pdfParseModule;

// Tipos para el servidor
interface ChunkData {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  text: string;
}

interface DocData {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  totalPages: number;
  content: string;
  chunks: ChunkData[];
}

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json({ limit: '15mb' }));

// Almacenamiento en memoria para el servidor RAG interactivo
let documentStore: DocData[] = [];

// Helper para dividir texto en chunks con solapamiento (Chunking Algorithm)
function splitTextIntoChunks(text: string, chunkSize: number = 500, overlap: number = 50, docId: string, docName: string): ChunkData[] {
  const chunks: ChunkData[] = [];
  const cleanText = (text || '')
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
  
  if (!cleanText) {
    return [{
      id: `${docId}-c1`,
      documentId: docId,
      documentName: docName,
      pageNumber: 1,
      text: `Documento PDF: ${docName}. Contenido listo para consulta.`
    }];
  }

  // Detectar páginas si existen marcas [Página X]
  const pageMatches = [...cleanText.matchAll(/\[Página\s+(\d+)\]/gi)];

  if (pageMatches.length > 0) {
    for (let i = 0; i < pageMatches.length; i++) {
      const currentPage = parseInt(pageMatches[i][1], 10) || (i + 1);
      const startIndex = pageMatches[i].index! + pageMatches[i][0].length;
      const endIndex = i < pageMatches.length - 1 ? pageMatches[i + 1].index! : cleanText.length;
      const pageContent = cleanText.substring(startIndex, endIndex).trim();

      if (!pageContent) continue;

      let start = 0;
      while (start < pageContent.length) {
        const end = Math.min(start + chunkSize, pageContent.length);
        const chunkText = pageContent.substring(start, end).trim();
        if (chunkText.length > 5) {
          chunks.push({
            id: `${docId}-p${currentPage}-c${chunks.length + 1}`,
            documentId: docId,
            documentName: docName,
            pageNumber: currentPage,
            text: chunkText
          });
        }
        if (end >= pageContent.length) break;
        start += (chunkSize - overlap);
      }
    }
  } else {
    let start = 0;
    while (start < cleanText.length) {
      const end = Math.min(start + chunkSize, cleanText.length);
      const chunkText = cleanText.substring(start, end).trim();
      if (chunkText.length > 5) {
        chunks.push({
          id: `${docId}-c${chunks.length + 1}`,
          documentId: docId,
          documentName: docName,
          pageNumber: 1,
          text: chunkText
        });
      }
      if (end >= cleanText.length) break;
      start += (chunkSize - overlap);
    }
  }

  if (chunks.length === 0) {
    chunks.push({
      id: `${docId}-c1`,
      documentId: docId,
      documentName: docName,
      pageNumber: 1,
      text: cleanText.substring(0, 1000) || `Documento PDF: ${docName}`
    });
  }

  return chunks;
}

// Inicializar tienda con documentos iniciales
function initDefaultDocs() {
  documentStore = INITIAL_SAMPLE_DOCS.map(doc => {
    const chunks = splitTextIntoChunks(doc.content, 500, 50, doc.id, doc.name);
    return {
      id: doc.id,
      name: doc.name,
      size: doc.size,
      uploadDate: doc.uploadDate,
      totalPages: doc.totalPages,
      content: doc.content,
      chunks
    };
  });
}

initDefaultDocs();

// Algoritmo de similitud de texto semántico/léxico mejorado
function calculateCosineSimilarity(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
       .replace(/[^\w\s]/g, ' ');

  const queryNorm = normalize(query);
  const textNorm = normalize(text);

  const queryWords = queryNorm.split(/\s+/).filter(w => w.length > 2);
  const textWords = textNorm.split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0 || textWords.length === 0) return 0;

  // Conteo de frecuencias
  const textFreq: Record<string, number> = {};
  textWords.forEach(w => textFreq[w] = (textFreq[w] || 0) + 1);

  let matchScore = 0;
  queryWords.forEach(qw => {
    if (textFreq[qw]) {
      matchScore += 2 + Math.log(textFreq[qw]);
    } else {
      // Coincidencia parcial por prefijo/raíz
      const partialMatch = textWords.some(tw => tw.startsWith(qw) || qw.startsWith(tw));
      if (partialMatch) matchScore += 1;
    }
  });

  // Bonificación por coincidencia de frase exacta
  if (textNorm.includes(queryNorm)) {
    matchScore += 5;
  }

  const normalizedScore = matchScore / (Math.sqrt(queryWords.length) * 1.5);
  return Math.min(Math.max(normalizedScore / 10, 0), 0.99);
}

// ==============================================================================
// RUTAS API REST (/api/rag/*)
// ==============================================================================

// Health check
app.get('/api/rag/health', (_req: Request, res: Response) => {
  const allChunksCount = documentStore.reduce((acc, d) => acc + d.chunks.length, 0);
  res.json({
    status: 'ok',
    documentsCount: documentStore.length,
    totalChunksCount: allChunksCount,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Obtener lista de documentos
app.get('/api/rag/documents', (_req: Request, res: Response) => {
  const docsList = documentStore.map(d => ({
    id: d.id,
    name: d.name,
    size: d.size,
    uploadDate: d.uploadDate,
    totalPages: d.totalPages,
    chunkCount: d.chunks.length,
    status: 'indexed'
  }));
  res.json(docsList);
});

// Cargar nuevo archivo PDF
app.post('/api/rag/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No se subió ningún archivo PDF.' });
      return;
    }

    let pdfText = '';
    let totalPages = 1;

    try {
      const pdfData = await pdfParse(req.file.buffer, {
        pagerender: function(pageData: any) {
          return pageData.getTextContent().then(function(textContent: any) {
            let lastY, text = '';
            for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY) {
                text += item.str + ' ';
              } else {
                text += '\n' + item.str + ' ';
              }
              lastY = item.transform[5];
            }
            return `\n[Página ${pageData.pageIndex + 1}]\n` + text;
          });
        }
      });

      pdfText = pdfData.text || '';
      totalPages = pdfData.numpages || 1;
    } catch (e) {
      console.warn('Advertencia en pdfParse, aplicando extracción directa:', e);
      // Fallback a texto en buffer si el renderizador por página falla
      try {
        const fallbackData = await pdfParse(req.file.buffer);
        pdfText = fallbackData.text || '';
        totalPages = fallbackData.numpages || 1;
      } catch (e2) {
        pdfText = req.file.buffer.toString('utf-8');
      }
    }

    // Si aún así no hay texto legible
    if (!pdfText || pdfText.trim().length === 0) {
      pdfText = `Documento ${req.file.originalname}. Archivo PDF subido con ${req.file.size} bytes.`;
    }

    const docId = `doc-${Date.now()}`;
    const docName = req.file.originalname;
    const chunkSize = parseInt(req.body.chunkSize as string, 10) || 500;
    const overlap = parseInt(req.body.overlap as string, 10) || 50;

    const chunks = splitTextIntoChunks(pdfText, chunkSize, overlap, docId, docName);

    const newDoc: DocData = {
      id: docId,
      name: docName,
      size: req.file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      totalPages,
      content: pdfText,
      chunks
    };

    documentStore.push(newDoc);

    res.json({
      message: 'PDF subido e indexado con éxito',
      document: {
        id: newDoc.id,
        name: newDoc.name,
        chunkCount: chunks.length,
        totalPages
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: `Error al procesar el PDF: ${error.message}` });
  }
});

// Cargar texto directo o simular PDF
app.post('/api/rag/documents/raw', (req: Request, res: Response) => {
  const { name, content, chunkSize = 500, overlap = 50 } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: 'Nombre y contenido son requeridos.' });
    return;
  }

  const docId = `doc-${Date.now()}`;
  const chunks = splitTextIntoChunks(content, chunkSize, overlap, docId, name);

  const newDoc: DocData = {
    id: docId,
    name,
    size: content.length,
    uploadDate: new Date().toISOString().split('T')[0],
    totalPages: Math.ceil(content.length / 1000) || 1,
    content,
    chunks
  };

  documentStore.push(newDoc);
  res.json({ message: 'Documento indexado con éxito', documentId: docId, chunkCount: chunks.length });
});

// Eliminar un documento
app.delete('/api/rag/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = documentStore.length;
  documentStore = documentStore.filter(d => d.id !== id);
  if (documentStore.length === initialLength) {
    res.status(404).json({ error: 'Documento no encontrado.' });
  } else {
    res.json({ message: 'Documento eliminado del almacenamiento vectorial.' });
  }
});

// Obtener todos los chunks almacenados
app.get('/api/rag/chunks', (_req: Request, res: Response) => {
  const allChunks = documentStore.flatMap(d => d.chunks);
  res.json(allChunks);
});

// Re-ejecutar ingesta (reset a defaults o re-chunking)
app.post('/api/rag/ingest', (req: Request, res: Response) => {
  const { chunkSize = 500, overlap = 50, resetToDefaults = false } = req.body || {};
  
  if (resetToDefaults) {
    initDefaultDocs();
  } else {
    documentStore = documentStore.map(doc => ({
      ...doc,
      chunks: splitTextIntoChunks(doc.content, chunkSize, overlap, doc.id, doc.name)
    }));
  }

  const totalChunks = documentStore.reduce((acc, d) => acc + d.chunks.length, 0);
  res.json({
    status: 'success',
    message: 'Ingesta re-ejecutada correctamente',
    documentsCount: documentStore.length,
    totalChunks
  });
});

// Endpoint principal RAG: /api/rag/ask
app.post('/api/rag/ask', async (req: Request, res: Response) => {
  try {
    const { question, top_k = 5 } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'La pregunta no puede estar vacía.' });
      return;
    }

    const trimmedQuestion = question.trim();

    // 1. Obtener lista de documentos
    const docNames = documentStore.map(d => d.name).join(', ') || 'Ninguno';

    // 2. Obtener todos los chunks
    const allChunks = documentStore.flatMap(d => d.chunks);

    if (allChunks.length === 0) {
      res.json({
        answer: '¡Hola! Qué gusto saludarte. Soy Gigi, tu asesora de ventas de HP Colombia. Actualmente no tenemos ningún catálogo o documento PDF cargado. Por favor, sube tus archivos en la pestaña "Subir Archivos" para poder orientarte sobre nuestros productos y servicios.',
        sources: [],
        found_in_context: false,
        retrieved_chunks_count: 0
      });
      return;
    }

    // 3. Calcular similitud semántica
    const scoredChunks = allChunks.map(chunk => ({
      chunk,
      score: calculateCosineSimilarity(trimmedQuestion, chunk.text)
    }));

    scoredChunks.sort((a, b) => b.score - a.score);

    let topChunks = scoredChunks.slice(0, top_k);
    const maxScore = topChunks[0]?.score || 0;

    // Si la pregunta es abierta o de resumen, incluir fragmentos iniciales
    if (maxScore < 0.02) {
      const sampleChunks = documentStore.flatMap(d => d.chunks.slice(0, 2));
      const sampleScored = sampleChunks.map(c => ({ chunk: c, score: 0.05 }));
      topChunks = [...topChunks, ...sampleScored].slice(0, top_k);
    }

    const contextText = topChunks
      .map(c => `[Documento: "${c.chunk.documentName}", Página: ${c.chunk.pageNumber}]\n${c.chunk.text}`)
      .join('\n\n---\n\n');

    const systemInstruction = `Eres Gigi, la asesora ejecutiva de atención al cliente e información corporativa de HP Colombia.
Tu estilo es estrictamente profesional, corporativo, claro y directo en español.

DOCUMENTO OFICIAL CONSULTADO:
${docNames}

FRAGMENTOS RECUPERADOS DEL DOCUMENTO:
--- CONTEXTO INICIO ---
${contextText}
--- CONTEXTO FIN ---

REGLAS STRICTAS DE RESPUESTA DE GIGI:
1. **CERO EMOJIS**: Está PROHIBIDO usar emojis de cualquier tipo en tus respuestas. Mantén un tono técnico y comercial formal.
2. **SIN SALUDOS REPETITIVOS**: NO saludes ni te vuelvas a presentar en cada respuesta. Solo saluda si el usuario te envía un saludo inicial explícito. En preguntas de consulta o seguimiento, entra DIRECTAMENTE a dar la respuesta exacta.
3. **RESPUESTAS PRECISAS Y CONCISAS**: Responde únicamente a lo que se pregunta, sin explicaciones redundantes ni relleno.
4. **CERO ALUCINACIONES**: Basate ÚNICAMENTE en los datos contenidos en el contexto. Si la información solicitada no figura en el documento, responde exactamente con esta frase: "La información solicitada no se encuentra disponible en la documentación oficial de HP Colombia."
5. **FORMATO LIMPIO Y ESTRUCTURADO**: Usa Markdown profesional con negritas únicamente en nombres de modelos, valores o plazos clave. Usa guiones (-) para listas.`;

    const sources = topChunks.map(item => ({
      documentName: item.chunk.documentName,
      pageNumber: item.chunk.pageNumber,
      chunkText: item.chunk.text,
      similarityScore: Math.round(item.score * 10000) / 10000
    }));

    let answer = '';

    // 1. Proveedor Primario: Gemini API (con modelos válidos de Gemini)
    if (process.env.GEMINI_API_KEY) {
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      for (const modelName of modelsToTry) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: modelName,
            contents: trimmedQuestion,
            config: {
              systemInstruction,
              temperature: 0.1
            }
          });

          if (geminiRes.text) {
            answer = geminiRes.text;
            break;
          }
        } catch (geminiError: any) {
          console.warn(`Gemini (${modelName}) no disponible o sin cuota:`, geminiError?.message || geminiError);
        }
      }
    }

    // 2. Proveedor Secundario de Respaldo: Groq API (Llama 3.3 70B Versatile)
    if (!answer) {
      try {
        const groqApiKey = process.env.GROQ_API_KEY || ' ';
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: trimmedQuestion }
            ],
            temperature: 0.1,
            max_tokens: 1024,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          answer = groqData.choices?.[0]?.message?.content || '';
        } else {
          console.warn('Groq API devolvió estado:', groqRes.status);
        }
      } catch (groqError: any) {
        console.warn('Error al conectar con Groq API:', groqError?.message || groqError);
      }
    }

    // 3. Fallback en caso de indisponibilidad de ambas APIs
    if (!answer) {
      const bestChunk = topChunks[0]?.chunk;
      if (bestChunk && maxScore > 0.01) {
        answer = `De acuerdo con la documentación oficial de HP Colombia (Página ${bestChunk.pageNumber}):\n\n${bestChunk.text}`;
      } else {
        answer = `En este momento el servicio externo de IA no está disponible. Puedes consultar las fuentes directas del documento en la sección inferior.`;
      }
    }

    res.json({
      answer,
      sources,
      found_in_context: sources.length > 0,
      prompt_used: systemInstruction,
      retrieved_chunks_count: sources.length
    });

  } catch (error: any) {
    res.status(500).json({ error: `Error en el servidor RAG: ${error.message}` });
  }
});

// ==============================================================================
// CONFIGURACIÓN DE VITE / PRODUCCIÓN
// ==============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor RAG ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
