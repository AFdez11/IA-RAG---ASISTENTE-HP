export interface SampleDoc {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  totalPages: number;
  content: string;
}

export const INITIAL_SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'doc-hp-colombia',
    name: 'Catalogo_Productos_y_Politicas_HP_Colombia.pdf',
    size: 420000,
    uploadDate: new Date().toISOString().split('T')[0],
    totalPages: 6,
    content: `[Página 1]
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
  * Obras de destino en municipios e intermedias: 3 a 5 días hábiles.
- Envío Gratuito: Despacho prioritario sin costo para compras cuyo valor supere los $200.000 COP. Todos los envíos cuentan con número de guía para rastreo en tiempo real y seguro de transporte contra pérdida o daño.

[Página 6]
6. PREGUNTAS FRECUENTES (FAQ) Y TÉRMINOS Y CONDICIONES
- ¿Los productos cuentan con garantía oficial en Colombia? Sí, todos los productos y equipos HP distribuidos en Colombia cuentan con garantía oficial directa de 1 a 3 años, la cual incluye atención técnica en centros de servicio autorizados o soporte a domicilio según la línea del equipo.
- ¿Qué medios de pago están disponibles? Tarjetas de crédito y débito (Visa, Mastercard, American Express), PSE (Pago Seguro en Línea), Efecty, Mercado Pago y facilidades de financiamiento a plazos mediante Addi y Sistecrédito.
- ¿Cómo se emite la factura electrónica? La factura electrónica con validación DIAN se genera automáticamente y se envía al correo electrónico registrado al momento de completar la compra.
- Términos Comerciales: Todos los precios expresados están en Pesos Colombianos (COP) e incluyen el Impuesto al Valor Agregado (IVA). Las promociones están sujetas a disponibilidad de inventario.`
  },
  {
    id: 'doc-hp-terminos',
    name: 'Terminos_y_Condiciones_HP_Colombia.pdf',
    size: 580000,
    uploadDate: new Date().toISOString().split('T')[0],
    totalPages: 7,
    content: `[Página 1]
TÉRMINOS Y CONDICIONES - TIENDA OFICIAL HP.COM COLOMBIA
Titular de la Marca: HP Colombia S.A.S. (NIT 900.824.185-5)
Operadores Autorizados: Castor Data S.A.S. / Smart Buy (MPS S.A.)
Jurisdicción: República de Colombia (Ley 1480 de 2011)
Última Actualización: Julio de 2026

A continuación, se presentan de manera íntegra, exhaustiva y detallada los Términos y Condiciones que regulan el acceso, navegación, uso y transacciones comerciales efectuadas en la Tienda Virtual Oficial de HP en Colombia (www.hp.com/co-es/shop).

Módulos y Secciones Generales:
1. Ámbito de Aplicación (2 Cláusulas): Identificación legal de las partes, marco normativo e idoneidad del sitio web.
2. Proceso de Compra (3 Cláusulas): Mecanismos de oferta, aceptación del pedido, confirmación y disponibilidad de stock.
3. Métodos de Pago (6 Cláusulas): Pasarelas de pago, tarjetas, PSE, financiamiento, validación de seguridad y reversiones.
4. Envíos y Entregas (3 Cláusulas): Cobertura nacional, tiempos de despacho, tarifas de envío y transferencia de riesgo.
5. Facturación (2 Cláusulas): Emisión de factura electrónica DIAN, datos del comprador y modificaciones contables.
6. Aspectos Legales y Responsabilidades (11 Cláusulas): Propiedad intelectual, exenciones, capacidad legal, hipervínculos, habeas data y fueros.
7. Comunicaciones (2 Cláusulas): Canales oficiales de atención, notificaciones comerciales y soporte técnico al cliente.
8. Devoluciones y Reembolsos (5 Cláusulas): Derecho de retracto (Ley 1480), procedimiento de devolución, tiempos y costos logísticos.
9. Garantías (1 Cláusula): Garantía legal del fabricante, alcance, exclusiones y red de centros autorizados.

[Página 2]
1. ÁMBITO DE APLICACIÓN
1.1. Identificación de las Partes y Naturaleza del Sitio Web:
Los presentes Términos y Condiciones rigen las relaciones comerciales y el uso del sitio web www.hp.com/co-es/shop (la "Tienda Online HP Colombia"). HP Colombia S.A.S., identificada con NIT 900.824.185-5 y con domicilio principal en la Carrera 11B No. 99-25 Piso 14 de Bogotá D.C., es la titular de la marca y de los derechos de explotación del portal web. La comercialización, facturación, recaudo, preparación y despacho logístico de los productos son operados por sus distribuidores autorizados: Castor Data S.A.S. (NIT 830.034.195-5, Tocancipá) y Smart Buy / MPS Mayorista de Colombia S.A. (NIT 830.018.214-1, Cota), referidos como los "PROVEEDORES DE SERVICIOS". Al ingresar y comprar, el usuario adquiere la condición de Cliente y declara haber leído, comprendido y aceptado en su totalidad estos términos.

1.2. Aceptación, Modificaciones y Alcance Territorial:
El uso de la Tienda Online HP Colombia está estrictamente sujeto al cumplimiento de estos Términos y Condiciones y a las leyes de Colombia. Las ofertas, ventas y envíos aplican exclusivamente para el territorio de la República de Colombia donde exista cobertura de las empresas de transporte de carga aliadas.

2. PROCESO DE COMPRA
2.1. Oferta de Productos, Precios y Disponibilidad de Inventario:
La exhibición de computadores, impresoras, monitores, consumibles y accesorios constituye una invitación a contratar. Las ofertas están sujetas a la disponibilidad real de inventario. Los precios están expresados en pesos colombianos (COP) e incluyen el Impuesto a las Ventas (IVA) del 19% o tributos aplicables. En caso de detectarse un error manifiesto e insubsanable en el precio publicado, se informará de inmediato al Cliente para confirmar con el precio correcto o cancelar con reembolso total del importe pagado.

2.2. Perfeccionamiento del Contrato de Compraventa y Validación del Pedido:
La orden emitida al hacer clic en "Finalizar Compra" representa una oferta formal de compra. El contrato se perfecciona únicamente cuando el pedido haya sido validado, verificado el pago por la entidad bancaria o pasarela, y expedida la "Confirmación de Pedido y Factura" mediante correo electrónico. Se reserva el derecho discrecional de rechazar o cancelar cualquier orden por motivos de seguridad transaccional, inconsistencias, sospecha de fraude o falta de inventario físico.

[Página 3]
2.3. Límites de Compra y Uso Consumidor Final:
Los productos están orientados al uso personal, institucional, educativo o profesional de usuarios finales. Con el propósito de garantizar equidad y prevenir la reventa no autorizada o acaparamiento, se podrán establecer límites máximos sobre la cantidad de unidades por cliente o transacción. Compras corporativas de gran volumen deben gestionarse por los canales institucionales de venta directa de HP Colombia.

3. MÉTODOS DE PAGO
3.1. Pasarela de Pagos Segura y Medios Electrónicos Habilitados:
Las transacciones se procesan a través de pasarelas de pago certificadas bajo estándares PCI-DSS. Modalidades electrónicas habilitadas: tarjetas de crédito (Visa, Mastercard, American Express, Diners Club); transferencias débitas mediante PSE (Pagos Seguros en Línea); y tarjetas de débito con CVC/CVV para e-commerce.

3.2. Líneas de Financiamiento y Crédito Directo / Aliados:
En caso de habilitarse opciones de financiación o compra en cuotas con entidades aliadas (Addi, Sistecrédito u otros emisor crediticios), la aprobación del crédito, intereses, tarifas administrativas y cuotas de manejo son responsabilidad exclusiva de la entidad otorgante.

3.3. Verificación de Seguridad y Antifraude:
Toda transacción es sometida a validación de seguridad automatizada y manual. Se podrá requerir al Cliente documentación adicional (copia de documento de identidad o confirmación telefónica) antes de procesar el despacho. En caso de no superar los filtros o confirmarse una inconsistencia grave, el pedido será cancelado automáticamente y los fondos retenidos serán revertidos al medio de pago origen.

3.4. Reversión del Pago (Artículo 51, Ley 1480 de 2011):
De conformidad con el Artículo 51 de la Ley 1480 de 2011 y Decreto 587 de 2016, el Cliente podrá solicitar la reversión del pago cuando la compra haya sido objeto de fraude, corresponda a una operación no solicitada, el producto no sea recibido, entregado no corresponda a lo solicitado o sea defectuoso. Debe presentar queja formal dentro de los cinco (5) días hábiles siguientes a la fecha en que tuvo conocimiento, notificando al emisor del pago.

3.5. Retenciones Tributarias y Moneda de Operación:
Todas las transacciones se cobran en Pesos Colombianos (COP). Personas jurídicas sujetas a retenciones en la fuente deberán coordinar previamente con el departamento de contabilidad de los PROVEEDORES DE SERVICIOS.

[Página 4]
3.6. Cupones de Descuento y Códigos Promocionales:
Los cupones de descuento y códigos promocionales poseen términos específicos de validez, tope de descuento y mínimo de compra. No son acumulables con otras promociones salvo indicación expresa, no son canjeables por dinero en efectivo.

4. ENVÍOS Y ENTREGAS
4.1. Cobertura Nacional y Plazos Estimados de Despacho:
Los envíos se realizan a las principales ciudades y municipios de Colombia a través de transporte especializado. Tiempos promedio de entrega: Bogotá, Medellín, Cali y Barranquilla de 2 a 5 días hábiles contados desde la confirmación del pago. Para ciudades intermedias y municipios el plazo es de 5 a 10 días hábiles.

4.2. Tarifas de Envío y Condiciones de Entrega:
El costo del envío se calcula e informa antes de finalizar el pago. Se ofrecen promociones de "Envío Gratis" sujetas a monto mínimo de compra o productos seleccionados. La entrega se considera efectuada al momento en que la transportadora entrega el paquete en la dirección registrada recolectando firma de recepción.

4.3. Transferencia de Riesgo y Verificación del Empaque:
El riesgo de pérdida o daño se transfiere al Cliente en la entrega. Es obligación inspeccionar el estado de la caja. En caso de sellos rotos, empaques abiertos o abolladuras, el receptor deberá abstenerse de firmar la guía de satisfacción y notificar a la Tienda Online HP Colombia en un plazo no mayor a 24 horas.

5. FACTURACIÓN
5.1. Emisión de Factura Electrónica de Venta (Normativa DIAN):
Los PROVEEDORES DE SERVICIOS (Castor Data S.A.S. o Smart Buy / MPS Mayorista S.A.) expedirán Factura Electrónica de Venta por cada transacción en formato PDF y XML enviada al correo del Cliente, cumpliendo la normativa DIAN.

5.2. Correcciones y Modificaciones Contables de Factura:
Solicitudes de notas crédito/débito o modificación de datos deberán tramitarse dentro del mismo mes calendario de compra o máximo cinco (5) días hábiles posteriores a su expedición con copia del RUT actualizado.

[Página 5]
6. ASPECTOS LEGALES Y RESPONSABILIDADES
6.1. Propiedad Intelectual y Marcas Registradas:
Todo contenido alojado en la Tienda Online HP Colombia (textos, logos, marcas, imágenes, gráficos, software) es propiedad exclusiva de HP Development Company, L.P. Queda prohibida la reproducción, duplicación, venta o explotación comercial sin consentimiento previo y escrito.

6.2. Uso Aceptable e Integridad del Sitio Web:
El usuario se compromete a utilizar el portal exclusivamente para fines lícitos. Queda prohibido alterar, dañar o sobrecargar los servidores, intentar acceder sin autorización o utilizar robots/scrapers para extraer datos.

6.3. Exención de Garantía sobre Disponibilidad Técnica del Portal:
HP Colombia y los proveedores no garantizan acceso ininterrumpido o libre de errores al sitio web por mantenimientos programados o fallas en telecomunicaciones.

6.4. Capacidad Legal para Contratar:
Servicios dirigidos a personas con capacidad legal plena según el Código Civil Colombiano. Los menores de edad deben contar con supervisión y autorización de sus padres o tutores legales.

6.5. Enlaces a Sitios Web de Terceros:
Los hipervínculos a sitios externos (pasarelas de pago, operadores logísticos) se proporcionan únicamente para conveniencia del Cliente, sin responsabilidad sobre sus contenidos o prácticas de privacidad.

6.6. Limitación General de Responsabilidad Operativa:
La responsabilidad total acumulada de HP Colombia y los proveedores por cualquier reclamación derivada del sitio o compra estará limitada al valor total pagado por el Cliente por el producto o servicio objeto de controversia.

6.7. Protección de Datos Personales (Habeas Data - Ley 1581 de 2012):
En cumplimiento de la Ley 1581 de 2012 y Decreto 1377 de 2013, los datos personales se tratarán con confidencialidad en bases de datos automatizadas para facturación, despacho y atención. El Cliente puede ejercer sus derechos de conocer, actualizar, rectificar y suprimir enviando un correo a los canales oficiales.

[Página 6]
6.8. Caso Fortuito y Fuerza Mayor:
No habrá responsabilidad por incumplimiento parcial o total cuando sea consecuencia de eventos imprevisibles e irresistibles (desastres naturales, paros, emergencias sanitarias).

6.9. Divisibilidad y Nulidad Parcial de Cláusulas:
Si cualquier disposición fuere declarada nula o ineficaz por un juez, dicha declaración no afectará la validez del resto de las cláusulas.

6.10. Ausencia de Renuncia de Derechos:
La omisión o demora en el ejercicio de un derecho o facultad no constituirá renuncia implícita.

6.11. Ley Aplicable y Jurisdicción Competente:
Estos Términos y Condiciones se rigen bajo la legislación de la República de Colombia. Cualquier controversia será sometida a la jurisdicción ordinaria de los jueces de la República de Colombia con fuero en la ciudad de Bogotá D.C.

7. COMUNICACIONES
7.1. Canales Oficiales de Atención y Soporte al Cliente:
- Línea telefónica nacional gratuita: 01-800-519-1349
- Línea fija Bogotá: (601) 643-0236 (Opción 3)
- Portal Web de Contacto: formulario en línea disponible en www.hp.com/co-es/shop/contacto
- Chat en vivo con agentes de soporte en el portal oficial.

7.2. Notificaciones Electrónicas y Consentimiento Comercial:
Notificaciones de pedido, facturas electrónicas y comunicaciones se enviarán al correo registrado. Las comunicaciones publicitarias requerirán autorización previa con enlace de cancelación ágil ("Unsubscribe").

8. DEVOLUCIONES Y REEMBOLSOS
8.1. Derecho de Retracto (Artículo 47, Ley 1480 de 2011):
El Cliente podrá ejercer el Derecho de Retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto. El producto deberá ser devuelto en perfectas condiciones, sin uso, en su empaque original sellado con manuales y accesorios completos.

8.2. Exclusiones al Derecho de Retracto:
Se exceptúan productos personalizados, licencias de software descargadas o activadas, y consumibles de impresión (cartuchos de tinta o tóners) cuyo empaque protector haya sido abierto.

[Página 7]
8.3. Procedimiento y Logística de Devolución:
Solicitud mediante portal o líneas telefónicas. Se emitirá una guía de transporte para la recolección del producto o entrega en oficina de mensajería autorizada.

8.4. Costos de Transporte en Devoluciones:
En el ejercicio del Derecho de Retracto voluntario, los costos de transporte son asumidos por el Cliente. Si la devolución responde a un producto defectuoso, falla de fábrica o despacho errado, los costos logísticos serán cubiertos en su totalidad por los PROVEEDORES DE SERVICIOS.

8.5. Tiempos y Modalidad del Reembolso de Dinero:
Una vez recibido y verificado en bodega central, se procederá al reembolso total en un plazo no superior a treinta (30) días calendario contados desde el ejercicio del derecho.

9. GARANTÍAS
9.1. Garantía Legal de Productos y Servicios HP:
Todos los productos cuentan con la Garantía Limitada de Fábrica otorgada por HP Inc. conforme a la Ley 1480 de 2011. El término oscila entre uno (1) y tres (3) años según la categoría. Cubre defectos de fabricación, componentes de hardware o mano de obra. Excluye daños por mal uso, negligencia, descargas eléctricas, derrames de líquidos o uso de consumibles no originales. Para hacer efectiva la garantía, el Cliente puede acudir a la Red de Centros de Servicio Autorizados HP (CAS) en todo el país o comunicarse con la línea de Soporte Técnico HP.

Nota Legal Complementaria: El presente documento unifica y recopila en su totalidad los Términos y Condiciones vigentes aplicables a las compras en la Tienda Oficial HP.com Colombia (www.hp.com/co-es/shop). Administrado en coordinación con Castor Data S.A.S. y Smart Buy (MPS Mayorista S.A.).`
  }
];
