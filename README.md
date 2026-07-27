# Asesora Corporativa HP Colombia - Gigi (Sistema RAG Multimodal)

Bienvenido al repositorio oficial del **Sistema de Atención al Cliente y RAG (Retrieval-Augmented Generation) para HP Colombia**, liderado por la asesora virtual **Gigi**.

---

## 1. Descripción General del Proyecto

Esta aplicación es una solución de inteligencia artificial corporativa diseñada para resolver inquietudes de los clientes de **HP Colombia** en tiempo real. Gigi opera utilizando un motor RAG estructurado que consulta directamente la documentación oficial de la marca:

1. **`Catalogo_Productos_y_Politicas_HP_Colombia.pdf`**: Información técnica de laptops (Spectre, Envy, Pavilion, OMEN, Victus), impresoras (Smart Tank, LaserJet), políticas de privacidad (Ley 1581 de 2012) y envíos en Colombia.
2. **`Terminos_y_Condiciones_HP_Colombia.pdf`**: Marco legal de la Tienda Virtual (Ley 1480 de 2011), derecho de retracto, pasarelas de pago, garantías y logística.

### Características Principales
- **Atención personalizada y humanizada**: Gigi responde de forma clara, profesional y amable sin uso de emojis.
- **Visor Multimodal de PDF integrado**: Permite a los usuarios inspeccionar y hojear los dos archivos PDF oficiales página por página directamente en la interfaz.
- **Respuestas basadas exclusivamente en fuentes verídicas**: RAG con citas precisas para evitar alucinaciones.
- **Historial persistente y reinicio de chat**: Control de la sesión conversacional almacenado localmente.

---

## 2. Arquitectura de la Solución

El sistema sigue una arquitectura Full-Stack moderna desacoplada y optimizada para producción:

```
┌─────────────────────────────────────────────────────────┐
│                 CLIENTE (Frontend React)                │
│  - ChatView (Interfaz de conversación)                  │
│  - Header & PdfModal (Visor interactivo de 2 PDFs)      │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP POST /api/chat
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVIDOR (Node.js Express)               │
│  1. Normalización de pregunta y extracción de tokens    │
│  2. Pipeline RAG: Indexación vectorizada de fragmentos  │
│  3. Búsqueda semántica por Similitud de Coseno & TF-IDF │
│  4. Construcción del Prompt con Contexto Inyectado      │
└───────────────────────────┬─────────────────────────────┘
                            │ 
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     PROVEEDOR PRIMARIO    │ │    PROVEEDOR DE RESPALDO  │
│  Google Gemini API        │ │  Groq API (Llama-3)       │
│  (gemini-3.6-flash, etc.) │ │  (Fallback automático)    │
└───────────────────────────┘ └───────────────────────────┘
```

1. **Ingesta e Indexación de Documentos**: Los textos de los PDF se dividen en fragmentos lógicos indexados por páginas y secciones.
2. **Retrieval (Recuperación)**: Al recibir una consulta, el backend calcula la relevancia del texto usando coincidencia semántica y léxica, seleccionando los pasajes más relevantes de los PDFs.
3. **Augmentation & Generation (Generación)**: Se construye un prompt restringido con los fragmentos relevantes y se envía al LLM para sintetizar la respuesta formal.

---

## 3. Tecnologías y Herramientas Utilizadas

- **Frontend**:
  - React 18 + Vite + TypeScript
  - Tailwind CSS (Estilizado responsive y accesible)
  - Lucide React (Iconografía vectorial)
  - React Markdown (Renderizado de formato enriquecido)
- **Backend & RAG Engine**:
  - Node.js + Express
  - SDK `@google/genai` (Google AI Studio)
  - SDK `groq-sdk` (Redundancia de modelo)
  - Algoritmo vectorizado con Similitud del Coseno (Cosine Similarity)
- **Despliegue & Contenedores**:
  - Docker / Google Cloud Run (Puerto 3000)

---

## 4. Instrucciones para Ejecutar el Proyecto

### Requisitos Previos
- Node.js 18 o superior instalado.
- Cuenta en Google AI Studio o Groq para obtener clave API (opcional en fallback).

### Pasos de Instalación

1. **Clonar el repositorio e instalar dependencias**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd applet
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz basándote en `.env.example`:
   ```env
   GEMINI_API_KEY=tu_clave_gemini_aqui
   GROQ_API_KEY=tu_clave_groq_aqui (opcional)
   NODE_ENV=development
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

4. **Compilar y ejecutar en producción**:
   ```bash
   npm run build
   npm start
   ```

---

## 5. Ejemplos de Preguntas que el Agente Puede Responder

Gigi está capacitada para responder preguntas técnicas, comerciales, logísticas y de atención general:

- **Catálogo de Equipos**: *"¿Qué computadores e impresoras tienen disponibles para venta?"*
- **Garantías**: *"¿Cuánto tiempo de garantía tienen las portátiles OMEN o las impresoras Smart Tank?"*
- **Devoluciones y Retracto**: *"¿Cómo puedo solicitar el reembolso de un producto y cuántos días tengo?"*
- **Envíos**: *"¿Cuánto se demora un envío hacia Medellín o Bogotá y cuánto cuesta?"*
- **Facturación**: *"¿Cómo solicito mi factura electrónica con la DIAN?"*
- **Preguntas Personales / Amables**: *"¿Quién eres Gigi?"*, *"¿Qué linda estás Gigi"*.

---

## 6. Ejemplos de Respuestas Generadas por el Agente

### Ejemplo 1: Consulta de Productos Disponibles

> **Usuario:** ¿Qué productos están disponibles?
>
> **Gigi (Asesora HP):**
>
> En la Tienda Oficial de **HP Colombia** disponemos de las siguientes líneas principales de productos:
>
> **Laptops y Computadores Portátiles**:
> - **HP Spectre y Envy**: Equipos de gama alta con pantallas táctiles OLED, procesadores Intel Core Ultra / AMD Ryzen 7 y chasis de aluminio.
> - **HP Pavilion y Serie 240/250**: Portátiles versátiles ideales para estudio y trabajo de oficina.
> - **HP OMEN y Victus**: Laptops para videojuegos y diseño profesional con tarjetas gráficas NVIDIA GeForce RTX Serie 40 y refrigeración OMEN Tempest Cooling.
>
> **Impresoras y Multifuncionales**:
> - **HP Smart Tank (Modelos 580, 670, 750)**: Sistema de tanque de tinta recargable con rendimiento de hasta 12.000 páginas en negro y 8.000 a color.
> - **HP LaserJet Pro**: Impresión láser ultrarrápida con dúplex automático para empresas y PyMEs.
>
> **Monitores y Accesorios**: Monitores ergonómicos HP Serie 5 y 7, teclados, mouses inalámbricos y hubs multipuerto.

---

### Ejemplo 2: Consulta sobre Políticas de Devolución

> **Usuario:** ¿Cómo funciona las políticas de devolución?
>
> **Gigi (Asesora HP):**
>
> Con gusto le explico la política de devoluciones y reembolsos de **HP Colombia**, establecida bajo la Ley 1480 de 2011:
>
>La política de devoluciones y el derecho de retracto en HP Colombia se rigen bajo las siguientes condiciones: Derecho de Retracto: El cliente puede solicitar la devolución del producto y el reembolso total del dinero dentro de los cinco (5) días hábiles siguientes a la entrega de la compra, conforme a la normativa comercial colombiana. Condiciones del Producto: Para que la devolución sea efectiva, el producto debe encontrarse en perfecto estado, con su empaque original sin abrir o alterar, incluyendo todos los accesorios, manuales, cables y sellos intactos.

---

### Ejemplo 3: Consulta Amable o Elogio

> **Usuario:** Qué linda estás Gigi
>
> **Gigi (Asesora HP):**
>
> Muchas gracias por su amable cumplido. Es un gusto saludarle.
>
> Como asesora corporativa de **HP Colombia**, estoy aquí para brindarle la mejor atención e información sobre nuestros computadores, impresoras, garantías o políticas de compra.
>
> ¿En qué le puedo colaborar el día de hoy?
