# Asesora Virtual HP Colombia - Gigi (Sistema RAG en Python con Streamlit)

Bienvenido al repositorio oficial del **Sistema de Atención al Cliente y RAG (Retrieval-Augmented Generation) para Hewlett-Packard Colombia**, liderado por la asesora ejecutiva virtual **Gigi**, desarrollada en **Python** con **Streamlit** e integrada con **Google Gemini API** y servidor de respaldo **Groq API**.

---

## 1. Visión General del Proyecto

Esta aplicación es una solución de Inteligencia Artificial corporativa diseñada para responder inquietudes de los clientes de **HP Colombia** en tiempo real con alta fidelidad y velocidad. Gigi opera mediante un motor RAG (Retrieval-Augmented Generation) estructurado que indexa y consulta de forma estricta la documentación oficial de la marca:

1. **`Catalogo_Productos_y_Politicas_HP_Colombia.pdf`**:
   - Catálogo oficial de laptops (Spectre, Envy, Pavilion, OMEN, Victus) e impresoras (Smart Tank 580/670/750 y LaserJet Pro).
   - Especificaciones técnicas (Procesadores Intel Core Ultra, AMD Ryzen, tarjetas NVIDIA GeForce RTX 40).
   - Políticas de privacidad y protección de datos personales (Ley 1581 de 2012 de Colombia).
   - Tiempos de entrega y cobertura de envíos nacionales (Bogotá, Medellín, Cali y municipios).
2. **`Terminos_y_Condiciones_HP_Colombia.pdf`**:
   - Marco legal de la Tienda Virtual Oficial (`HP Colombia S.A.S.`, NIT 900.824.185-5).
   - Estatuto del Consumidor de Colombia (Ley 1480 de 2011).
   - Procedimiento del **Derecho de Retracto** (5 días hábiles), políticas de garantía (30 días por defecto de fábrica) y reversión de pago.
   - Métodos de pago aceptados (PSE, tarjetas de crédito, Efecty, financiamiento Addi / Sistecrédito) y facturación electrónica DIAN.

---

## 2. Características Destacadas de Gigi

- **Nivel de Concisión y Precisión Ajustado (7/10)**: Diseñado para ofrecer una respuesta óptima que no se limite a una frase ni aburra con textos gigantes. Proporciona datos exactos (modelos, especificaciones, plazos, políticas) con explicaciones breves y estructuradas.
- **Cero Emojis & Tono Corporativo**: Garantiza un estilo formal, técnico y comercial acorde con los estándares de HP Colombia.
- **Sin Saludos Repetitivos**: Responde directamente a cada pregunta sin volver a presentarse o saludar innecesariamente en cada interacción.
- **Arquitectura de Redundancia y Resiliencia (Dual API)**: Conexión principal con **Google Gemini API** (`gemini-2.5-flash`, `gemini-1.5-flash`) y conmutación automática de respaldo a **Groq API** (`llama-3.3-70b-versatile`) en caso de saturación o falla de quota.
- **Protección de Credenciales**: Las claves API están protegidas en `.env` e ignoradas en Git mediante `.gitignore` para prevenir filtraciones de seguridad.
- **Indexación y Carga de Documentos PDF**: Extrae texto de los PDFs con `PyPDF`, realiza fragmentación (*chunking*) con solapamiento por páginas y permite subir nuevos archivos PDF dinámicamente.

---

## 3. Arquitectura del Sistema RAG

```
┌─────────────────────────────────────────────────────────┐
│               INTERFAZ STREAMLIT (`app.py`)             │
│  - Barra lateral: Claves API (Gemini / Groq), PDFs     │
│  - Carga dinámica de archivos PDF adicionales           │
│  - Vista principal: Chat, botones rápidos e historial   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│             MOTOR RAG & INDEXADOR EN PYTHON             │
│  1. Extracción de texto y etiquetado de páginas (PyPDF) │
│  2. Fragmentación inteligente con solapamiento          │
│  3. Algoritmo de scoring léxico-semántico y TF-IDF      │
│  4. Recuperación del Top 5 de fragmentos más relevantes │
│  5. Inyección de contexto y reglas de negocio al Prompt  │
└───────────────────────────┬─────────────────────────────┘
                            │ 
             ┌──────────────┴──────────────┐
             │ (API Principal)             │ (API de Respaldo)
             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     GOOGLE GEMINI API     │ │         GROQ API          │
│ - gemini-2.5-flash        │ │ - llama-3.3-70b-versatile │
│ - gemini-1.5-flash        │ │   (Fallback Automático)   │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 4. Tecnologías Utilizadas

- **Lenguaje**: Python 3.9+
- **Framework de Interfaz**: Streamlit 1.30+
- **Procesamiento de Lenguaje / LLM**:
  - Google GenAI SDK (`google-genai` / `google-generativeai`)
  - Groq API vía HTTPS (`urllib.request`)
- **Procesamiento de PDF & RAG**: `pypdf` + Algoritmo de similitud de términos con normalización de acentos.
- **Variables de Entorno**: `python-dotenv`
- **Despliegue**: Streamlit Community Cloud (Hosting gratuito) / Servidor propio.

---

## 5. Instalación y Ejecución en Local

### Paso 1: Requisitos Previos
Asegúrate de tener **Python 3.9** o superior instalado en tu equipo. Puedes verificarlo con:
```bash
python --version
```

### Paso 2: Clonar el Repositorio e Instalar Dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd <DIRECTORIO_DEL_PROYECTO>
pip install -r requirements.txt
```

### Paso 3: Configurar las Claves API en `.env`
Crea un archivo `.env` en la raíz del proyecto para definir tus claves privadas:
```env
# Clave principal de Gemini (Obtener en Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY=tu_clave_gemini_aqui

# Clave opcional de respaldo (Obtener en Groq Cloud: https://console.groq.com/)
GROQ_API_KEY=tu_clave_groq_aqui
```
*(También puedes ingresar o modificar las claves API en cualquier momento desde los campos de texto en la barra lateral de Streamlit).*

### Paso 4: Iniciar la Aplicación Streamlit
```bash
streamlit run app.py
```
La aplicación se abrirá automáticamente en tu navegador web en **`http://localhost:8501`**.

---

## 6. Despliegue Gratuito en Línea (Streamlit Community Cloud)

Puedes publicar la aplicación en internet de manera gratuita en menos de 2 minutos siguiendo estos pasos:

1. Subes el código de este repositorio a tu cuenta de **GitHub**.
2. Dirígete a **[share.streamlit.io](https://share.streamlit.io)** e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"New app"**, selecciona tu repositorio de GitHub, la rama `main` y define el archivo de entrada como **`app.py`**.
4. Haz clic en **"Advanced settings"** -> **"Secrets"** y pega tus credenciales de entorno:
   ```toml
   GEMINI_API_KEY = "tu_clave_gemini_aqui"
   GROQ_API_KEY = "tu_clave_groq_aqui"
   ```
5. Presiona **"Deploy!"**. Streamlit compilará la app y te entregará una URL pública instantánea.

---

## 7. Estructura del Repositorio

```
├── app.py                   # Código principal de la app en Python (Streamlit + RAG + Dual API)
├── requirements.txt         # Lista de librerías de Python requeridas
├── .env.example             # Plantilla de ejemplo para variables de entorno
├── .gitignore               # Exclusión de credenciales (.env, secrets) y archivos temporales
├── README.md                # Documentación oficial del proyecto
├── package.json             # Manifiesto opcional de Node.js
└── server.ts                # Servidor alternativo en TypeScript/Express
```

---

## 8. Ejemplos de Preguntas y Respuestas de Gigi

### Ejemplo 1: Consulta sobre Portátiles e Impresoras
> **Usuario:** ¿Qué productos están disponibles?
>
> **Gigi (Asesora HP):**
>
> En la Tienda Oficial de **HP Colombia** disponemos de las siguientes líneas principales de productos:
>
> **Laptops y Computadores Portátiles**:
> - **HP Spectre y Envy**: Equipos de gama alta con pantallas táctiles OLED, procesadores Intel Core Ultra / AMD Ryzen 7 y chasis de aluminio.
> - **HP Pavilion y Serie 240/250**: Portátiles versátiles ideales para estudio y trabajo de oficina.
> - **HP OMEN y Victus**: Equipos gaming con tarjetas gráficas NVIDIA GeForce RTX Serie 40 y sistema de refrigeración OMEN Tempest Cooling.
>
> **Impresoras y Multifuncionales**:
> - **HP Smart Tank (Modelos 580, 670, 750)**: Sistema de tanque de tinta recargable con rendimiento de hasta 12.000 páginas en negro y 8.000 a color.
> - **HP LaserJet Pro**: Impresión láser de alta velocidad con función dúplex automática para empresas.
>
> **Monitores y Accesorios**: Monitores ergonómicos HP Serie 5 y 7, mouses, teclados inalámbricos y hubs multipuerto.

---

### Ejemplo 2: Consulta sobre Políticas de Devolución
> **Usuario:** ¿Cómo funcionan las políticas de devolución?
>
> **Gigi (Asesora HP):**
>
> La política de devoluciones y reembolsos de **HP Colombia** contempla las siguientes pautas:
>
> - **Derecho de Retracto (5 Días Hábiles)**: Puede solicitar la devolución del producto y el reembolso total del dinero dentro de los **cinco (5) días hábiles** posteriores a la entrega. El equipo debe entregarse en su empaque original sin abrir ni alterar, con todos los sellos y accesorios intactos.
> - **Garantía por Defectos de Fábrica (30 Días)**: Si el producto presenta fallas técnicas dentro de sus primeros **30 días calendario** de uso, HP Colombia realiza el reemplazo directo del equipo o la devolución del importe en un plazo de **8 a 12 días hábiles**.
> - **Tiempo de Reembolso**: La devolución formal del dinero se efectúa en un plazo máximo de **30 días calendario** contados a partir de la aprobación de la solicitud.
