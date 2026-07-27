import React, { useState } from 'react';
import { Cloud, Copy, Check, Terminal, Shield, HardDrive, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

export const OciGuide: React.FC = () => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: '1. Construcción y Prueba Local de la Imagen Docker',
      subtitle: 'Verifica que el contenedor funcione en tu máquina local antes de subir a OCI.',
      commands: `# 1. Construir la imagen Docker localmente
docker build -t rag-agent:v1 .

# 2. Ejecutar el contenedor localmente pasando la clave de API en variable de entorno
docker run -d -p 8000:8000 \\
  -e GEMINI_API_KEY="sk-api-key-aqui" \\
  --name rag-agent-local \\
  rag-agent:v1

# 3. Probar endpoint de salud
curl http://localhost:8000/health`,
      notes: 'Asegúrate de que la carpeta docs/ tenga al menos un PDF antes de construir, o ejecuta la ingesta vía endpoint POST /ingest.'
    },
    {
      title: '2. Iniciar Sesión y Subir Imagen a OCI Container Registry (OCIR)',
      subtitle: 'Publica la imagen Docker en el registro de contenedores privado de Oracle Cloud.',
      commands: `# 1. Generar un 'Auth Token' en la consola de OCI (User Settings > Auth Tokens).

# 2. Iniciar sesión en OCI Container Registry
docker login mx-queretaro-1.ocir.io -u <tenancy-namespace>/<tu_usuario_oci>

# 3. Etiquetar la imagen local con la URI de OCIR
docker tag rag-agent:v1 mx-queretaro-1.ocir.io/<tenancy-namespace>/rag-agent:v1

# 4. Subir (push) la imagen a OCIR
docker push mx-queretaro-1.ocir.io/<tenancy-namespace>/rag-agent:v1`,
      notes: 'Puedes consultar tu Tenancy Namespace en la consola de OCI en Tenancy Details.'
    },
    {
      title: '3. Configurar la Persistencia con OCI Block Volume (ChromaDB)',
      subtitle: 'Garantiza que la base de datos vectorial no se borre al reiniciar el contenedor.',
      commands: `# Pasos en Consola de OCI:
1. Ve a 'Storage' > 'Block Volumes' > 'Create Block Volume'.
2. Nombre: 'chroma-db-volume', Tamaño: 50 GB (Performance: Balanced 10 VPU/GB).
3. Selecciona la misma Availability Domain (AD) donde desplegarás la instancia de contenedor.
4. En el paso de creación del Container Instance, bajo 'Volume Mounts':
   - Source: Block Volume ('chroma-db-volume')
   - Mount Path en el contenedor: /app/chroma_db`,
      notes: 'El volumen del sistema de archivos mantendrá las colecciones de ChromaDB intactas.'
    },
    {
      title: '4. Desplegar en OCI Container Instances & Secretos',
      subtitle: 'Creación de la instancia de contenedor sin necesidad de administrar clústeres Kubernetes.',
      commands: `# En la consola de OCI (Developer Services > Container Instances > Create Container Instance):

1. Nombre de la Instancia: 'rag-agent-instance'
2. Compartimento: Selecciona tu compartimento.
3. Shape: 1 OCPU, 4 GB RAM (Suficiente para SentenceTransformers + FastAPI).
4. Configuración de Contenedor:
   - Image URL: mx-queretaro-1.ocir.io/<tenancy-namespace>/rag-agent:v1
5. Variables de entorno (Environment Variables):
   - GEMINI_API_KEY = "tu-clave-secreta"
   (O utiliza OCI Vault Secret Reference)
6. Red y Puertos:
   - Asignar IP Pública: Sí
   - Ingress Rule: Permitir tráfico TCP puerto 8000 en la VCN Security List.`,
      notes: 'No olvides habilitar el puerto 8000 en el Security List de la VCN para poder consultar la API desde internet.'
    },
    {
      title: '5. Verificación y Prueba del Endpoint en Producción',
      subtitle: 'Comprueba el funcionamiento del agente RAG desplegado en Oracle Cloud.',
      commands: `# 1. Probar estado de salud en la IP Pública de OCI
curl http://<PUBLIC_IP_OCI>:8000/health

# 2. Enviar una pregunta vía cURL
curl -X POST "http://<PUBLIC_IP_OCI>:8000/ask" \\
     -H "Content-Type: application/json" \\
     -d '{
       "question": "¿Cuál es la política de devoluciones de la empresa?",
       "top_k": 4
     }'`,
      notes: 'Respuesta esperada: JSON con el texto de la respuesta, lista de fuentes citadas con página/snippet y el flag found_in_context=true.'
    }
  ];

  return (
    <div id="oci-guide-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-slate-200 p-6 shadow-sm mb-8 rounded-none">
        <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center text-white">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Guía de Despliegue en Oracle Cloud Infrastructure (OCI)</h2>
            <p className="text-[11px] font-mono text-slate-500">OCI Container Instances • OCIR • Block Volume Persistence</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          Paso a paso para llevar el agente de IA RAG desde el entorno local hasta producción en OCI, garantizando la persistencia de la base vectorial ChromaDB y la protección de credenciales.
        </p>
      </div>

      {/* Tarjetas de Arquitectura OCI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5 space-y-2 rounded-none shadow-sm">
          <div className="flex items-center space-x-2 text-blue-600 font-bold uppercase tracking-wider text-[11px]">
            <Terminal className="w-4 h-4" />
            <span>01. OCI Registry (OCIR)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Almacenamiento privado de imágenes etiquetadas con estándar Docker v2 para despliegues ágiles.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 space-y-2 rounded-none shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold uppercase tracking-wider text-[11px]">
            <Shield className="w-4 h-4" />
            <span>02. Container Instances</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ejecución Serverless de contenedores en segundos sin necesidad de gestionar clústeres Kubernetes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 space-y-2 rounded-none shadow-sm">
          <div className="flex items-center space-x-2 text-blue-800 font-bold uppercase tracking-wider text-[11px]">
            <HardDrive className="w-4 h-4" />
            <span>03. OCI Block Volume</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Persistencia para la carpeta <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5">/app/chroma_db</code> ante reinicios.
          </p>
        </div>
      </div>

      {/* Pasos Interactivos */}
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 shadow-sm space-y-4 rounded-none">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-600 text-white text-xs flex items-center justify-center font-mono font-bold">
                    0{idx + 1}
                  </span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-500 pl-8">{step.subtitle}</p>
              </div>

              <button
                onClick={() => copyToClipboard(step.commands, idx)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border border-slate-900 transition-colors shrink-0 cursor-pointer rounded-none"
              >
                {copiedStep === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedStep === idx ? '¡Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            {/* Terminal Block */}
            <div className="bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed rounded-none">
              <pre>{step.commands}</pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs text-blue-900 flex items-center space-x-2 rounded-none">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span><strong>Nota clave:</strong> {step.notes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
