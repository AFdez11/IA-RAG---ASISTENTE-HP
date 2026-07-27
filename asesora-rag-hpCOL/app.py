import os
import re
import math
import streamlit as st
from pypdf import PdfReader
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración de página de Streamlit
st.set_page_config(
    page_title="Gigi - Asesora HP Colombia",
    page_icon="💻",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilo personalizado para la interfaz corporativa de HP Colombia
st.markdown("""
<style>
    .main-header {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #0096D6;
        font-weight: 700;
        margin-bottom: 0px;
    }
    .sub-header {
        color: #4A5568;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
    }
    .chat-container {
        background-color: #F8FAFC;
        border-radius: 10px;
        padding: 1rem;
    }
    .stButton>button {
        background-color: #0096D6;
        color: white;
        border-radius: 6px;
        font-weight: 600;
        border: none;
    }
    .stButton>button:hover {
        background-color: #0077A8;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# Documentos predeterminados de HP Colombia (Textos integrados)
CATALOGO_HP_TEXT = """[Página 1]
CATÁLOGO OFICIAL Y DOCUMENTACIÓN DE POLÍTICAS Y PRODUCTOS HP COLOMBIA

1. LÍNEA DE PRODUCTOS HP EN COLOMBIA
- Laptops HP Spectre y Envy: Portátiles de gama alta para ejecutivos, profesionales y creadores. Pantallas táctiles OLED, procesadores Intel Core Ultra y AMD Ryzen 7, chasis de aluminio y baterías de larga duración.
- Laptops HP Pavilion y Serie 240/250: Equipos versátiles para estudio, oficina y tareas cotidianas con alto rendimiento y excelente relación costo-beneficio.
- Laptops Gaming HP OMEN y Victus: Diseñados para entusiastas de los videojuegos y renderizado profesional. Tarjetas gráficas NVIDIA GeForce RTX Serie 40, pantallas de alta tasa de refresco y sistema de refrigeración OMEN Tempest Cooling.
- Impresoras HP Smart Tank (Modelos 580, 670, 750): Equipos multifuncionales de tanque de tinta recargable. Rendimiento de hasta 12.000 páginas en negro y 8.000 a color con las botellas de tinta originales incluidas en la caja. Conexión Wi-Fi autorreparable y app HP Smart.
- Impresoras HP LaserJet Pro: Tecnología láser ultrarrápida para empresas y PyMEs, impresión dúplex automática y altos estándares de eficiencia energética.
- Monitores y Accesorios: Monitores ergónomicos HP Serie 5 y Serie 7, mouses, teclados inalámbricos y hubs multipuerto.

[Página 2]
2. CARACTERÍSTICAS TÉCNICAS Y SEGURIDAD INTEGRADA
- Procesadores y Gráficos: Integración de procesadores Intel Core de 13ª/14ª Generación, Intel Core Ultra y AMD Ryzen 7000/8000. Gráficos integrados Intel Iris Xe / AMD Radeon y dedicados NVIDIA GeForce RTX.
- Pantallas y Salud Visual: Paneles IPS e OLED antirreflejo con certificación TÜV Rheinland de baja luz azul (EyeEase) para reducir la fatiga ocular en jornadas extensas.
- Conectividad de Última Generación: Wi-Fi 6E, Bluetooth 5.3, puertos USB-C Thunderbolt 4 y tecnología HP Fast Charge (carga del 50% de la batería en aproximadamente 45 minutos).
- Seguridad Empresarial HP Wolf Security: Protección integral basada en hardware, resguardo a nivel de BIOS (HP Sure Start), obturador físico deslizable para la cámara web y lector biométrico de huellas dactilares.

[Página 3]
3. POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES
HP Colombia garantiza la confidencialidad de la información en estricto cumplimiento de la Ley 1581 de 2012 de Protección de Datos Personales de Colombia.
- Los datos suministrados por los clientes (nombre completo, documento de identidad, dirección de entrega, correo electrónico y teléfono) se utilizan de manera exclusiva para la atención de pedidos, logística de despacho, facturación y soporte técnico.
- HP Colombia no vende ni comparte datos personales con terceros no autorizados.
- Los clientes pueden ejercer sus derechos de hábeas data (conocer, actualizar, rectificar o solicitar la supresión de sus datos) contactando al canal oficial de atención al cliente.

[Página 4]
4. POLÍTICA DE REEMBOLSO Y DEVOLUCIONES
- Derecho de Retracto: De acuerdo con la normativa comercial colombiana, el cliente puede solicitar la devolución del producto y el reembolso total del dinero dentro de los cinco (5) días hábiles siguientes a la entrega de la compra.
- Condiciones del Producto: El producto debe devolverse en perfecto estado, en su empaque original sin abrir o alterar, con todos los accesorios, manuales, cables y sellos intactos.
- Garantía de Satisfacción y Defectos de Fábrica: En caso de presentarse una falla técnica o defecto de fabricación dentro de los primeros treinta (30) días calendario de uso, HP Colombia realizará el reemplazo inmediato del equipo o el desembolso total del importe en un término de 8 a 12 días hábiles.

[Página 5]
5. GUÍA DE ENVÍOS Y ENTREGAS EN COLOMBIA
- Cobertura de Logística: Envíos a todo el territorio nacional de Colombia, abarcando ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cartagena, Pereira, Manizales, Cúcuta) y municipios intermedios.
- Tiempos de Entrega Estimados:
  * Ciudades Principales (Bogotá, Medellín, Cali): 24 a 48 horas hábiles.
  * Municipios intermedios: 3 a 5 días hábiles.
- Envío Gratuito: Despacho prioritario sin costo para compras cuyo valor supere los $200.000 COP. Todos los envíos cuentan con número de guía para rastreo en tiempo real y seguro de transporte contra pérdida o daño.

[Página 6]
6. PREGUNTAS FRECUENTES (FAQ) Y TÉRMINOS Y CONDICIONES
- ¿Los productos cuentan con garantía oficial en Colombia? Sí, todos los productos y equipos HP distribuidos en Colombia cuentan con garantía oficial directa de 1 a 3 años, la cual incluye atención técnica en centros de servicio autorizados o soporte a domicilio según la línea del equipo.
- ¿Qué medios de pago están disponibles? Tarjetas de crédito y débito (Visa, Mastercard, American Express), PSE (Pago Seguro en Línea), Efecty, Mercado Pago y financiamiento con Addi y Sistecrédito.
- ¿Cómo se emite la factura electrónica? La factura electrónica con validación DIAN se genera automáticamente y se envía al correo registrado.
- Términos Comerciales: Todos los precios expresados están en Pesos Colombianos (COP) e incluyen IVA (19%).
"""

TERMINOS_HP_TEXT = """[Página 1]
TÉRMINOS Y CONDICIONES - TIENDA OFICIAL HP.COM COLOMBIA
Titular de la Marca: HP Colombia S.A.S. (NIT 900.824.185-5)
Operadores Autorizados: Castor Data S.A.S. / Smart Buy (MPS S.A.)
Jurisdicción: República de Colombia (Ley 1480 de 2011)
Última Actualización: Julio de 2026

Términos y Condiciones que regulan la Tienda Virtual Oficial de HP en Colombia (www.hp.com/co-es/shop).

1. Ámbito de Aplicación: Identificación legal, marco normativo de Colombia (Ley 1480 de 2011 Estatuto del Consumidor).
2. Proceso de Compra: Oferta, confirmación de pedido y disponibilidad de inventarios.
3. Métodos de Pago: Pasarelas seguras PSE, tarjetas de crédito/débito, financiamiento.
4. Envíos y Entregas: Despachos a nivel nacional en Colombia con transportadoras autorizadas.
5. Facturación: Facturación electrónica con validación oficial DIAN.
6. Devoluciones y Reembolsos: Procedimiento de retracto de 5 días hábiles, reversión de pagos y garantías.

[Página 2]
1. ÁMBITO DE APLICACIÓN Y DERECHO DE RETRACTO
1.1. Identificación: HP Colombia S.A.S. (NIT 900.824.185-5) en Bogotá D.C. Operadores logísticos: Castor Data S.A.S. y MPS Mayorista de Colombia S.A.
1.2. Derecho de Retracto (Ley 1480 de 2011, Art. 47): El consumidor podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles contados a partir de la entrega del bien. El producto debe devolverse sin uso y en empaque sellado original.
1.3. Reembolso: El dinero será devuelto dentro de los 30 días calendario siguientes a la solicitud de retracto aprobada.
"""


def chunk_text(text: str, doc_name: str, chunk_size: int = 500, overlap: int = 50):
    """Algoritmo de fragmentación de texto por páginas con solapamiento."""
    chunks = []
    clean_text = re.sub(r'[^\S\r\n]+', ' ', text or '').strip()
    
    page_matches = list(re.finditer(r'\[Página\s+(\d+)\]', clean_text, re.IGNORECASE))
    
    if page_matches:
        for i, match in enumerate(page_matches):
            page_num = int(match.group(1))
            start_idx = match.end()
            end_idx = page_matches[i + 1].start() if i < len(page_matches) - 1 else len(clean_text)
            page_content = clean_text[start_idx:end_idx].strip()
            
            if not page_content:
                continue
                
            start = 0
            while start < len(page_content):
                end = min(start + chunk_size, len(page_content))
                chunk_str = page_content[start:end].strip()
                if len(chunk_str) > 5:
                    chunks.append({
                        "document": doc_name,
                        "page": page_num,
                        "text": chunk_str
                    })
                if end >= len(page_content):
                    break
                start += (chunk_size - overlap)
    else:
        start = 0
        while start < len(clean_text):
            end = min(start + chunk_size, len(clean_text))
            chunk_str = clean_text[start:end].strip()
            if len(chunk_str) > 5:
                chunks.append({
                    "document": doc_name,
                    "page": 1,
                    "text": chunk_str
                })
            if end >= len(clean_text):
                break
            start += (chunk_size - overlap)
            
    return chunks


def calculate_similarity(query: str, text: str) -> float:
    """Calcula la similitud de relevancia de palabras clave entre la pregunta y el fragmento."""
    if not query or not text:
        return 0.0
    
    def normalize(s: str) -> str:
        s = s.lower()
        import unicodedata
        s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        return re.sub(r'[^\w\s]', ' ', s)

    q_words = [w for w in normalize(query).split() if len(w) > 2]
    t_words = [w for w in normalize(text).split() if len(w) > 2]
    
    if not q_words or not t_words:
        return 0.0
    
    text_freq = {}
    for w in t_words:
        text_freq[w] = text_freq.get(w, 0) + 1
        
    score = 0.0
    for qw in q_words:
        if qw in text_freq:
            score += 2.0 + math.log(text_freq[qw])
        else:
            if any(tw.startswith(qw) or qw.startswith(tw) for tw in t_words):
                score += 1.0
                
    if normalize(query) in normalize(text):
        score += 5.0
        
    normalized = score / (math.sqrt(len(q_words)) * 1.5)
    return min(max(normalized / 10.0, 0.0), 0.99)


def query_gemini_api(api_key: str, system_instruction: str, user_prompt: str) -> str:
    """Invoca la API de Google Gemini utilizando el SDK oficial o requests."""
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # Probar modelos disponibles en orden de preferencia
        models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
        for model_name in models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_prompt,
                    config={
                        'system_instruction': system_instruction,
                        'temperature': 0.1
                    }
                )
                if response and response.text:
                    return response.text
            except Exception:
                continue
                
        # Fallback a google-generativeai si existe
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=api_key)
        model = legacy_genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
        res = model.generate_content(user_prompt)
        return res.text
    except Exception as e:
        return f"Error al consultar la API de Gemini: {str(e)}"


def query_groq_api(groq_key: str, system_instruction: str, user_prompt: str) -> str:
    """Invoca la API de Groq como servidor de respaldo secundario (Llama-3.3-70b-versatile)."""
    import json
    import urllib.request
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.1
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['choices'][0]['message']['content']
    except Exception as e:
        return f"Error en API de respaldo (Groq): {str(e)}"


def query_llm_api(gemini_key: str, groq_key: str, system_instruction: str, user_prompt: str) -> str:
    """Consulta la API principal de Google Gemini y hace fallback automático a Groq si falla."""
    if gemini_key:
        res = query_gemini_api(gemini_key, system_instruction, user_prompt)
        if res and not res.startswith("Error al consultar la API de Gemini"):
            return res
        # Si Gemini falló y tenemos Groq Key, intentamos el respaldo
        if groq_key:
            return query_groq_api(groq_key, system_instruction, user_prompt)
        return res
    elif groq_key:
        return query_groq_api(groq_key, system_instruction, user_prompt)
    else:
        return "Por favor, ingresa tu clave API de Gemini o Groq en la barra lateral para que Gigi responda a tus consultas."


# Estado de sesión de Streamlit
if "documents" not in st.session_state:
    st.session_state["documents"] = [
        {"name": "Catalogo_Productos_y_Politicas_HP_Colombia.pdf", "text": CATALOGO_HP_TEXT},
        {"name": "Terminos_y_Condiciones_HP_Colombia.pdf", "text": TERMINOS_HP_TEXT}
    ]

if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []

# Indexación de chunks
all_chunks = []
for doc in st.session_state["documents"]:
    all_chunks.extend(chunk_text(doc["text"], doc["name"]))

# BARRA LATERAL (Sidebar)
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg", width=80)
    st.title("Gigi - HP Colombia")
    st.caption("Sistema RAG de Atención al Cliente")
    
    st.divider()
    
    # Configuración de Claves API
    gemini_key_env = os.getenv("GEMINI_API_KEY", "")
    groq_key_env = os.getenv("GROQ_API_KEY", "")
    
    user_gemini_key = st.text_input("Clave API de Gemini (Principal):", value=gemini_key_env, type="password", help="Ingresa tu GEMINI_API_KEY")
    user_groq_key = st.text_input("Clave API de Groq (Respaldo opcional):", value=groq_key_env, type="password", help="Ingresa tu GROQ_API_KEY opcional")
    
    if user_gemini_key or user_groq_key:
        st.success("API Key(s) configurada(s)", icon="✅")
    else:
        st.warning("Sin clave API. Puedes ingresar Gemini API Key o Groq API Key.", icon="⚠️")
        
    st.divider()
    
    # Documentos Oficiales
    st.subheader("📄 Documentos en Contexto")
    for doc in st.session_state["documents"]:
        st.markdown(f"- **{doc['name']}**")
        
    st.caption(f"Total de fragmentos indexados: {len(all_chunks)}")
    
    # Subir nuevos PDF
    uploaded_file = st.file_uploader("Subir nuevo documento PDF", type=["pdf"])
    if uploaded_file is not None:
        try:
            reader = PdfReader(uploaded_file)
            extracted_text = ""
            for i, page in enumerate(reader.pages):
                extracted_text += f"\n[Página {i+1}]\n" + (page.extract_text() or "")
            
            new_doc_name = uploaded_file.name
            # Evitar duplicados
            if not any(d["name"] == new_doc_name for d in st.session_state["documents"]):
                st.session_state["documents"].append({"name": new_doc_name, "text": extracted_text})
                st.success(f"Documento '{new_doc_name}' subido e indexado con éxito.")
                st.rerun()
        except Exception as err:
            st.error(f"Error al leer el archivo PDF: {err}")
            
    st.divider()
    if st.button("🗑️ Limpiar Historial de Chat", use_container_width=True):
        st.session_state["chat_history"] = []
        st.rerun()

# CONTENIDO PRINCIPAL (Main View)
st.markdown("<h1 class='main-header'>Asesora Virtual HP Colombia - Gigi</h1>", unsafe_allow_html=True)
st.markdown("<p class='sub-header'>Consulte información oficial sobre equipos, precios, garantías, envíos y políticas de devolución.</p>", unsafe_allow_html=True)

# Preguntas de ejemplo rápidas
st.markdown("**Ejemplos de preguntas rápidas:**")
col1, col2, col3 = st.columns(3)

preset_question = None
if col1.button("¿Qué productos están disponibles?"):
    preset_question = "¿Qué productos están disponibles?"
if col2.button("¿Cómo funcionan las devoluciones?"):
    preset_question = "¿Cómo funciona las políticas de devolución?"
if col3.button("Qué linda estás Gigi"):
    preset_question = "Qué linda estás Gigi"

st.divider()

# Mostrar historial de chat
for msg in st.session_state["chat_history"]:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Entrada de pregunta del usuario
prompt_input = st.chat_input("Escribe tu pregunta para Gigi...")
query = preset_question or prompt_input

if query:
    # Agregar pregunta al historial
    st.session_state["chat_history"].append({"role": "user", "content": query})
    with st.chat_message("user"):
        st.markdown(query)

    # Procesar RAG
    with st.chat_message("assistant"):
        with st.spinner("Gigi está consultando la documentación oficial..."):
            # 1. Recuperar los fragmentos más relevantes
            scored = []
            for chunk in all_chunks:
                score = calculate_similarity(query, chunk["text"])
                scored.append({"chunk": chunk, "score": score})
            
            scored.sort(key=lambda x: x["score"], reverse=True)
            top_chunks = scored[:5]
            
            # Contexto
            context_text = "\n\n---\n\n".join([
                f"[Documento: \"{c['chunk']['document']}\", Página: {c['chunk']['page']}]\n{c['chunk']['text']}"
                for c in top_chunks
            ])
            
            doc_names = ", ".join([d["name"] for d in st.session_state["documents"]])
            
            # Instrucción del Sistema para Gigi
            system_instruction = f"""Eres Gigi, la asesora ejecutiva de atención al cliente e información corporativa de HP Colombia.
Tu estilo es profesional, corporativo, claro y directo en español.

DOCUMENTO OFICIAL CONSULTADO:
{doc_names}

FRAGMENTOS RECUPERADOS DEL DOCUMENTO:
--- CONTEXTO INICIO ---
{context_text}
--- CONTEXTO FIN ---

REGLAS ESTRICTAS DE RESPUESTA DE GIGI (NIVEL DE CONCISIÓN Y PRECISIÓN 7/10):
1. **BALANCE Y PRECISIÓN (7/10)**: Responde de forma puntual, clara y estructurada. Proporciona los datos clave (modelos, especificaciones, precios, plazos o políticas) con una explicación breve y completa, evitando rodeos innecesarios o textos excesivamente extensos.
2. **CERO EMOJIS**: Está PROHIBIDO usar emojis de cualquier tipo en tus respuestas. Mantén un tono técnico y comercial formal.
3. **SIN SALUDOS REPETITIVOS**: NO saludes ni te vuelvas a presentar en cada respuesta. Solo saluda si el usuario te envía un saludo inicial explícito. En preguntas de consulta o seguimiento, entra DIRECTAMENTE a dar la respuesta exacta.
4. **CERO ALUCINACIONES**: Básate ÚNICAMENTE en los datos contenidos en el contexto. Si la información solicitada no figura en el documento, responde exactamente con esta frase: "La información solicitada no se encuentra disponible en la documentación oficial de HP Colombia."
5. **FORMATO LIMPIO Y ESTRUCTURADO**: Usa Markdown profesional con negritas únicamente en nombres de modelos, valores o plazos clave. Organiza con guiones (-) para listas."""

            # Inclusión de historial reciente para memoria conversacional
            recent_msgs = st.session_state["chat_history"][:-1][-6:] # últimos 6 mensajes previos
            history_text = ""
            if recent_msgs:
                history_formatted = []
                for m in recent_msgs:
                    r = "Usuario" if m["role"] == "user" else "Gigi"
                    history_formatted.append(f"{r}: {m['content']}")
                history_text = "\n".join(history_formatted)

            full_prompt = f"""HISTORIAL DE LA CONVERSACIÓN PREVIA:
{history_text if history_text else 'Sin conversación previa.'}

PREGUNTA ACTUAL DEL USUARIO:
{query}"""

            # Invocación de API (Gemini con respaldo automático a Groq)
            active_gemini_key = user_gemini_key or gemini_key_env
            active_groq_key = user_groq_key or groq_key_env
            
            response_text = query_llm_api(active_gemini_key, active_groq_key, system_instruction, full_prompt)
                
            st.markdown(response_text)
            st.session_state["chat_history"].append({"role": "assistant", "content": response_text})
