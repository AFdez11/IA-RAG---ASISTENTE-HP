import { PythonFile } from '../types';

export const PYTHON_FILES: PythonFile[] = [
  {
    filename: 'ingest.py',
    phase: 'Fase 1',
    title: 'Pipeline de Ingesta Vectorial',
    description: 'Procesa documentos PDF de la carpeta docs/, genera chunks con solapamiento y persiste las incrustaciones en ChromaDB local.',
    code: `# ==============================================================================
# ingest.py - Pipeline de Ingesta y Vectorización de Documentos PDF
# ==============================================================================
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

# Cargar variables de entorno desde archivo .env
load_dotenv()

# Configuración de rutas
DOCS_DIR = Path("./docs")
CHROMA_DB_DIR = Path("./chroma_db")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Parámetros recomendados de división en fragmentos (chunking)
# - CHUNK_SIZE = 500: Mantiene unidades semánticas legibles y óptimas para embeddings.
# - CHUNK_OVERLAP = 50: Evita perder continuidad o contexto en los bordes del fragmento.
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


def run_ingestion():
    """
    Ejecuta el pipeline completo de carga de PDFs, fragmentación y
    almacenamiento en la base de datos vectorial Chroma.
    """
    print("==================================================")
    print("🚀 INICIANDO PIPELINE DE INGESTA VECTORIAL (RAG)")
    print("==================================================")

    # 1. Validar existencia del directorio de documentos
    if not DOCS_DIR.exists():
        print(f"📁 Creando el directorio de documentos: {DOCS_DIR.resolve()}")
        DOCS_DIR.mkdir(parents=True, exist_ok=True)
        print("⚠️ Coloca tus archivos PDF en la carpeta 'docs/' y vuelve a ejecutar ingest.py.")
        return

    # 2. Cargar todos los PDFs de la carpeta docs/
    print(f"📖 Cargando documentos PDF desde '{DOCS_DIR}'...")
    loader = PyPDFDirectoryLoader(str(DOCS_DIR))
    documents = loader.load()

    if not documents:
        print("⚠️ No se encontraron archivos PDF válidos en la carpeta 'docs/'.")
        print("   Por favor, agrega al menos un archivo PDF e reintenta.")
        return

    print(f"✅ Cargadas {len(documents)} páginas de documentos en total.")

    # 3. Fragmentar el texto en chunks manejables con solapamiento
    print(f"✂️ Fragmentando texto (chunk_size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\\n\\n", "\\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"🧩 Se generaron {len(chunks)} fragmentos (chunks) de contexto.")

    # 4. Inicializar el modelo local de embeddings (sin costo de API)
    print(f"🧠 Cargando modelo de embeddings local: '{EMBEDDING_MODEL_NAME}'...")
    embedding_function = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    # 5. Guardar/Actualizar la base vectorial persistente en ChromaDB
    print(f"💾 Guardando vectores en ChromaDB en '{CHROMA_DB_DIR}'...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_function,
        persist_directory=str(CHROMA_DB_DIR)
    )
    vectorstore.persist()

    print("==================================================")
    print("🎉 INGESTA COMPLETADA CON ÉXITO")
    print(f"   Vectores guardados en: {CHROMA_DB_DIR.resolve()}")
    print("==================================================")


if __name__ == "__main__":
    run_ingestion()
`
  },
  {
    filename: 'agent.py',
    phase: 'Fase 2',
    title: 'Clase del Agente RAG (Búsqueda + LLM)',
    description: 'Implementa el motor de recuperación semántica y generación grounded con Anthropic Claude o Gemini.',
    code: `# ==============================================================================
# agent.py - Motor del Agente de IA tipo RAG
# ==============================================================================
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# Configuración por defecto
CHROMA_DB_DIR = "./chroma_db"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Prompt estricto del sistema para evitar alucinaciones
SYSTEM_PROMPT = """Eres un asistente de IA especializado y extremadamente estricto.
Tu tarea es responder a las preguntas del usuario basándote ÚNICAMENTE en el siguiente contexto de documentos proporcionados.

--- CONTEXTO INICIO ---
{context}
--- CONTEXTO FIN ---

REGLAS OBLIGATORIAS:
1. Responde ÚNICAMENTE con base en la información explícita presente en el CONTEXTO anterior.
2. Si la respuesta NO se encuentra en el contexto, debes responder explícitamente:
   "Lo siento, la información solicitada no se encuentra disponible en los documentos proporcionados."
3. NUNCA inventes, supongas ni utilices conocimientos externos al contexto proporcionado.
4. Mantiene un tono profesional, claro y conciso en español.
"""

class RAGAgent:
    """Clase principal que coordina la búsqueda vectorial y la generación de respuesta."""

    def __init__(self, chroma_dir: str = CHROMA_DB_DIR, top_k: int = 4):
        self.chroma_dir = chroma_dir
        self.top_k = top_k

        # 1. Validar la existencia de la API Key de Anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "❌ ERROR CRÍTICO: No se encontró la variable de entorno ANTHROPIC_API_KEY ni GEMINI_API_KEY en el archivo .env"
            )

        # 2. Cargar modelo de embeddings local
        print("🔍 Cargando modelo de embeddings local...")
        self.embedding_function = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL_NAME)

        # 3. Conectar a la base vectorial ChromaDB
        if not os.path.exists(self.chroma_dir):
            raise FileNotFoundError(
                f"❌ Base de datos vectorial no encontrada en '{self.chroma_dir}'. "
                "Por favor ejecuta primero 'python ingest.py' para procesar los PDFs."
            )

        self.vectorstore = Chroma(
            persist_directory=self.chroma_dir,
            embedding_function=self.embedding_function
        )

        # 4. Inicializar el LLM (Claude 3.5 Sonnet)
        self.llm = ChatAnthropic(
            model_name="claude-3-5-sonnet-20241022",
            temperature=0.0,  # Temperatura 0 para minimizar variabilidad
            timeout=30,
            max_retries=2
        )

        # 5. Plantilla del Prompt
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{question}")
        ])

    def ask(self, question: str) -> Dict[str, Any]:
        """
        Recibe una pregunta, busca los fragmentos más relevantes y genera una respuesta fundamentada.
        """
        if not question or not question.strip():
            return {
                "answer": "Error: La pregunta enviada está vacía.",
                "sources": [],
                "found_in_context": False
            }

        # Búsqueda de fragmentos relevantes por similitud
        results = self.vectorstore.similarity_search_with_relevance_scores(
            query=question,
            k=self.top_k
        )

        if not results:
            return {
                "answer": "Lo siento, la información solicitada no se encuentra disponible en los documentos proporcionados.",
                "sources": [],
                "found_in_context": False
            }

        # Construir contexto y lista de fuentes
        context_parts = []
        sources = []

        for doc, score in results:
            file_name = doc.metadata.get("source", "Documento desconocido")
            file_name = os.path.basename(file_name)
            page_num = doc.metadata.get("page", 0) + 1  # 1-indexed

            context_parts.append(f"[Fuente: {file_name}, Página: {page_num}]\\n{doc.page_content}")
            sources.append({
                "document": file_name,
                "page": page_num,
                "snippet": doc.page_content[:150] + "...",
                "similarity_score": round(float(score), 4)
            })

        full_context = "\\n\\n".join(context_parts)

        # Invocación al LLM
        prompt = self.prompt_template.format_messages(
            context=full_context,
            question=question
        )

        llm_response = self.llm.invoke(prompt)
        answer_text = llm_response.content

        # Verificar si no se encontró respuesta en contexto
        found = "no se encuentra disponible" not in answer_text.lower()

        return {
            "answer": answer_text,
            "sources": sources,
            "found_in_context": found
        }


# MODO INTERACTIVO POR CONSOLA
if __name__ == "__main__":
    try:
        agent = RAGAgent()
        print("\\n==================================================")
        print("🤖 AGENTE DE IA RAG ACTIVADO (Modo Consola)")
        print("   Escribe 'salir' o 'exit' para finalizar.")
        print("==================================================\\n")

        while True:
            q = input("\\n❓ Pregunta: ").strip()
            if q.lower() in ["salir", "exit", "quit"]:
                print("👋 ¡Hasta luego!")
                break
            if not q:
                continue

            res = agent.ask(q)
            print("\\n🤖 Respuesta:")
            print(res["answer"])
            print("\\n📌 Fuentes utilizadas:")
            for s in res["sources"]:
                print(f"  • {s['document']} (Pág. {s['page']}) - Similitud: {s['similarity_score']}")

    except Exception as e:
        print(f"❌ Error al iniciar el agente: {e}")
`
  },
  {
    filename: 'main.py',
    phase: 'Fase 3',
    title: 'API REST con FastAPI',
    description: 'Expone los endpoints /ask, /ingest y /health para consumo externo vía JSON.',
    code: `# ==============================================================================
# main.py - Servidor API REST con FastAPI y Uvicorn
# ==============================================================================
import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from agent import RAGAgent
from ingest import run_ingestion

load_dotenv()

app = FastAPI(
    title="Agente RAG API",
    description="API REST para responder preguntas sobre documentos PDF usando RAG y Embeddings Vectoriales",
    version="1.0.0"
)

# Instancia global del agente RAG (Carga perezosa)
rag_agent: Optional[RAGAgent] = None


@app.on_event("startup")
def startup_event():
    """Inicializa la base de datos vectorial y el agente RAG al arrancar la API."""
    global rag_agent
    try:
        # Verificar si existe la base de datos vectorial; si no, ejecutar ingesta
        if not os.path.exists("./chroma_db"):
            print("⚠️ No se encontró la base vectorial chroma_db. Ejecutando ingesta inicial...")
            run_ingestion()

        rag_agent = RAGAgent()
        print("✅ Agente RAG cargado correctamente en la API.")
    except Exception as e:
        print(f"⚠️ Advertencia durante el inicio del agente: {e}")


# Esquemas de datos Pydantic
class AskRequest(BaseModel):
    question: str = Field(..., example="¿Cuál es el procedimiento de garantía?", description="Pregunta enviada por el usuario")
    top_k: Optional[int] = Field(default=4, ge=1, le=10, description="Número de fragmentos a recuperar")

class SourceModel(BaseModel):
    document: str
    page: int
    snippet: str
    similarity_score: float

class AskResponse(BaseModel):
    answer: str
    sources: List[SourceModel]
    found_in_context: bool


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Endpoint de salud del servicio para comprobación en OCI."""
    return {
        "status": "healthy",
        "agent_loaded": rag_agent is not None,
        "chroma_db_exists": os.path.exists("./chroma_db")
    }


@app.post("/ask", response_model=AskResponse, status_code=status.HTTP_200_OK)
def ask_question(request: AskRequest):
    """Endpoint principal para realizar consultas RAG."""
    global rag_agent
    if not rag_agent:
        try:
            rag_agent = RAGAgent()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"El agente RAG no pudo ser inicializado. Asegúrate de configurar ANTHROPIC_API_KEY y ejecutar ingest.py. Detalles: {e}"
            )

    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La pregunta no puede estar vacía."
        )

    response = rag_agent.ask(request.question)
    return response


@app.post("/ingest", status_code=status.HTTP_200_OK)
def reingest_documents():
    """Endpoint administrativo para re-ejecutar la ingesta de documentos en docs/."""
    global rag_agent
    try:
        run_ingestion()
        rag_agent = RAGAgent()
        return {"status": "success", "message": "Proceso de ingesta re-ejecutado y agente actualizado."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al re-ejecutar la ingesta: {e}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
`
  },
  {
    filename: 'requirements.txt',
    phase: 'Fase 1-3',
    title: 'Dependencias de Python',
    description: 'Lista de librerías necesarias con versiones probadas para compatibilidad.',
    code: `python-dotenv==1.0.1
langchain==0.3.14
langchain-community==0.3.14
langchain-core==0.3.29
langchain-text-splitters==0.3.5
langchain-anthropic==0.3.1
chromadb==0.6.0
sentence-transformers==3.3.1
pypdf==5.1.0
fastapi==0.115.6
uvicorn==0.34.0
pydantic==2.10.4
`
  },
  {
    filename: 'README.md',
    phase: 'Documentación',
    title: 'Guía de Instalación y Ejecución Local',
    description: 'Instrucciones paso a paso para ejecutar la ingesta, probar en consola y levantar la API REST.',
    code: `# Agente de IA tipo RAG (Retrieval-Augmented Generation)

Este proyecto implementa un agente de IA tipo RAG con Python, LangChain, ChromaDB y FastAPI.
Responde preguntas basándose **únicamente** en los documentos PDF ubicados en la carpeta \`docs/\`.

---

## 📋 Requisitos Previos

- Python 3.11 o superior.
- Una API Key de Anthropic Claude (\`ANTHROPIC_API_KEY\`) o Gemini (\`GEMINI_API_KEY\`).

---

## 🛠️ Instalación Local paso a paso

### 1. Clonar o descargar el código y crear entorno virtual
\`\`\`bash
# Crear entorno virtual en Python
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows (CMD):
venv\\Scripts\\activate
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
pip install --upgrade pip
pip install -r requirements.txt
\`\`\`

### 3. Configurar variables de entorno
Crea un archivo \`.env\` en la raíz del proyecto:
\`\`\`env
ANTHROPIC_API_KEY=tu_clave_aqui_sk_ant_...
\`\`\`

### 4. Agregar documentos PDF
Coloca tus archivos PDF en la carpeta \`docs/\`:
\`\`\`bash
mkdir -p docs
# Copia tus PDFs a la carpeta docs/
\`\`\`

---

## 🚀 Ejecución

### Paso 1: Ingesta y Vectorización (\`ingest.py\`)
Ejecuta el script para procesar los PDFs y generar los vectores en \`chroma_db/\`:
\`\`\`bash
python ingest.py
\`\`\`

### Paso 2: Probar el Agente en Consola (\`agent.py\`)
\`\`\`bash
python agent.py
\`\`\`

### Paso 3: Iniciar el Servidor API REST con FastAPI (\`main.py\`)
\`\`\`bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`
Accede a la documentación interactiva en Swagger UI: \`http://localhost:8000/docs\`

---

## 🧪 Petición de Prueba con cURL

\`\`\`bash
curl -X POST "http://localhost:8000/ask" \\
     -H "Content-Type: application/json" \\
     -d '{"question": "¿Cuál es la política de garantía?"}'
\`\`\`
`
  },
  {
    filename: 'Dockerfile',
    phase: 'Fase 4',
    title: 'Contenedor Docker para OCI',
    description: 'Empaquetado listo para producción en contenedores Linux con Python 3.11.',
    code: `# Usar imagen base liviana y oficial de Python 3.11
FROM python:3.11-slim

# Evitar escritura de bytecode de python (.pyc) y forzar buffer directo en logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establecer directorio de trabajo en la imagen
WORKDIR /app

# Instalar dependencias del sistema requeridas para compilación ligera
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente de la aplicación
COPY ingest.py agent.py main.py ./

# Crear directorios para documentos y almacenamiento de base vectorial
RUN mkdir -p /app/docs /app/chroma_db

# Exponer el puerto de la API FastAPI
EXPOSE 8000

# Comando de arranque predeterminado con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`
  },
  {
    filename: '.dockerignore',
    phase: 'Fase 4',
    title: 'Filtro Dockerignore',
    description: 'Evita subir secretos, entornos virtuales ni archivos innecesarios al contenedor.',
    code: `.env
venv/
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.git/
.gitignore
.vscode/
chroma_db/
docs/*.pdf
`
  }
];
