<div align="center">

# Alaska-1 – Documentación Estructural y Arquitectónica 

Plataforma web centrada en el cuidado responsable de mascotas: blog informativo, panel (dashboard) interactivo, autenticación básica, chatbot contextual especializado y componentes reutilizables en Vanilla JS + PHP sencillo.

</div>

---

## 1. Objetivos del Proyecto

1. Proveer contenido educativo (blog) sobre salud, bienestar, alimentación y ética animal.
2. Ofrecer un panel de usuario (dashboard) con gestión local (en memoria / localStorage) de mascotas y recordatorios.
3. Incluir un asistente conversacional (chatbot) con reglas de seguridad, filtrado de dominio y rate limiting.
4. Mantener una arquitectura simple, portable y fácilmente extensible sin frameworks pesados.
5. Permitir despliegue híbrido: servidor PHP (para login + sesión + endpoint chatbot) o servidor Node (opcional) como entorno de desarrollo mixto.

---

## 2. Estructura Real del Repositorio (Estado Actual)

La organización efectiva difiere de la estructura genérica anterior (assets/src/public). A continuación se documenta la estructura real y su propósito.

```
Alaska-1/
│
├── api/
│   └── chat/
│       └── index.php              # Endpoint POST /api/chat (motor rule-based + rate limiting + logging)
│
├── controllers/
│   └── UserController.js          # (Esqueleto / potencial controlador JS – no crítico en flujo actual)
│
├── data/
│   └── blog-articles.json         # Fuente original de artículos (ya inlining en blog.html tras fusión)
│
├── img/                           # Recursos gráficos usados en HTML/CSS
│
├── js/
│   ├── blog.js                    # (Original) Lógica del blog – AHORA embebida en blog.html
│   ├── dashboard.js               # (Original) Lógica del dashboard – AHORA embebida en dashboard.php
│   └── historial-visitas.js       # Script auxiliar (no modificado en esta fase)
│
├── php/
│   ├── botonera.php               # Fragmento/plantilla reutilizable (si es referenciado)
│   ├── conexion.php               # Conexión a base de datos (MySQL presumible)
│   ├── logout.php                 # Cierra la sesión PHP
│   ├── registro.php               # Alta de usuarios (si está habilitado)
│   └── validar_login.php          # Verifica credenciales y establece $_SESSION
│
├── utils/
│   ├── auth.js                    # Utilidades de autenticación (lado cliente, posible verificación local)
│   ├── chatbot.js                 # Widget del chatbot (UI + cliente fetch /api/chat) – inyectado en páginas
│   ├── ErrorHandler.js            # Manejador genérico (no central en la fase reciente)
│   ├── Logger.js                  # Utilidad para logging (front)
│   ├── storage.js                 # Abstracción localStorage/sessionStorage
│   └── Validator.js               # Validaciones reutilizables
│
├── views/
│   ├── ButtonView.js
│   ├── FormView.js
│   └── MenuView.js                # Componentes JS orientados a vistas (patrón minimal MVC frontend)
│
├── logs/ (runtime)                # Se crea dinámicamente: rate limit tokens + chatbot.log
│
├── style/                         # Hojas de estilo organizadas por contexto
│   ├── blog.css
│   ├── login.css
│   └── usuario.css
│
├── index.html
├── blog.html                      # Ahora SELF-CONTAINED: incluye artículos y lógica interna
├── contacto.html
├── citas.html
├── agenda.html
├── dashboard.php                  # SELF-CONTAINED: incluye lógica dashboard (sin js externo)
├── login.php                      # Página de login (PHP + formulario)
├── dashboard.css                  # Estilos específicos del panel
├── style.css                      # Estilos globales
├── style-adicional.css            # Extensiones / overrides
├── manifest.webmanifest           # PWA manifest básico
├── sw.js                          # Service Worker (si se activa caching)
├── 404.html                       # Página de error personalizada
├── server.js                      # Servidor Node opcional (Express + fallback HTTP nativo)
├── package.json                   # Dependencias Node (express + nodemon)
├── README.md                      # Documentación general (si existe)
├── README_ESTRUCTURA.md           # (Este documento ampliado)
└── CHATBOT_README.md              # Documentación específica del asistente
```

---

## 3. Componentes Clave

### 3.1 Frontend (HTML + Vanilla JS)
- Páginas estructuradas semánticamente (cabecera, main, secciones especializadas).
- Blog y Dashboard ahora integrados como single-file components (agilidad de despliegue y menor latencia inicial al evitar múltiples fetch internos).
- Chatbot insertado mediante `<script src="./utils/chatbot.js"></script>` en todas las páginas principales.

### 3.2 Chatbot
- UI: `utils/chatbot.js` (widget flotante, chips de sugerencias, historial en memoria, indicador de typing, manejo de estado minimalista).
- Backend: `api/chat/index.php`.
	- Clasificación de dominio vs. fuera de dominio.
	- Detección de contenido dañino/harmful (bloquea solicitudes peligrosas).
	- Detección de emergencia (respuestas con recomendación veterinaria inmediata).
	- Rate limiting: 10 req / 60 s por IP con almacenamiento de timestamps en fichero `chat_rate_<ip>.json`.
	- Logging: línea JSON por interacción en `logs/chatbot.log` (truncado de respuesta). Ejemplo:
		```json
		{"ts":"2025-09-11T10:23:45Z","ip":"127.0.0.1","q":"Calendario vacunas perro","a":"Perros: 6-8 sem..."}
		```
	- Base de conocimiento basada en coincidencia de keywords (scoring lineal). Devuelve categoría + texto.
	- Protección longitud de respuesta (`$MAX_ANSWER_LEN`).
	- Respuestas estructuradas: `{ answer, category, disclaimer, rate_limit_remaining }`.

### 3.3 Autenticación / Sesión PHP
- `validar_login.php` valida credenciales usando consulta preparada.
- Variables de sesión establecidas: `$_SESSION['usuario']`, `$_SESSION['usuario_id']`.
- `dashboard.php` exige sesión activa; muestra nombre derivado (correo si no hay nombre real).
- `logout.php` destruye la sesión y redirige.

### 3.4 Dashboard (Integrado)
- Se embebió el JS de `js/dashboard.js` dentro de `dashboard.php`.
- Datos simulados: mascotas, recordatorios, citas, artículos recientes, actividad.
- Render dinámico de tarjetas + modales para alta local.
- Interacción: no persiste todavía en base de datos; se puede extender a AJAX/REST.

### 3.5 Blog (Integrado)
- `blog.html` ahora incluye:
	- Array `BLOG_ARTICLES` inline (anteriormente `data/blog-articles.json`).
	- Clase `Blog` con: búsqueda (debounce), filtros, paginación, animaciones IntersectionObserver, “back to top”, notificaciones visuales.
- Eliminado fetch -> mejora offline y reduce latencia.
- Posible extensión: generar detalle dinámico usando `?id=` más plantillas.

### 3.6 Servidor Node (`server.js`)
- Modo dual:
	1. Express (si dependencia instalada) sirviendo estáticos y endpoints simulados.
	2. Fallback HTTP nativo (si `express` no está disponible) — robustez en entornos mínimos.
- Rutas API ficticias (`/api/users/*`, `/api/pets/*`, `/api/blog`, `/api/chat`).
- Chat integrado en Node difiere del PHP: intenta primero LLM (OpenAI/Azure) si variables de entorno están configuradas; caso contrario recurre a KB local.
- Sanitización mínima en feed blog mediante `escapeHTML`.

### 3.7 Utilidades JS
- `storage.js`: wrapper para abstracción segura de localStorage/sessionStorage.
- `Validator.js`: patrones de validación reutilizables (emails, campos vacíos, etc.).
- `Logger.js`: logging cliente (console + extensible a backend).
- `ErrorHandler.js`: centraliza gestión de errores potencial (no profundizado en esta fase).

---

## 4. Flujo de Usuario (Alta ↔ Sesión ↔ Uso)
1. Usuario accede a `login.php` o `index.html`.
2. En login envía credenciales -> `validar_login.php` -> sesión iniciada.
3. Acceso a `dashboard.php` (protegido): se cargan datos embebidos + posibilidad de agregar mascotas/recordatorios localmente.
4. Navega a blog (`blog.html`): puede buscar y filtrar artículos.
5. En cualquier vista usa el chatbot para consultas dentro del dominio.
6. Cierra sesión vía botón (remueve datos locales y destruye sesión PHP si se implementa en backend).

---

## 5. Seguridad y Salvaguardas Implementadas
| Aspecto | Implementación | Mejora Potencial |
|---------|----------------|------------------|
| Inyección SQL | Uso de `prepare()` en login | Aplicar a todos los endpoints futuros |
| XSS (Chatbot) | Sanitización al limitar respuestas; KB controlada | Escapar output de usuario siempre en UI dinámicas |
| Rate Limiting Chat | Archivos de timestamps por IP | Centralizar en Redis / Memcached si escala |
| Sesión PHP | Verificación en `dashboard.php` | Regenerar ID tras login; HTTPS obligatorio |
| Validación Dominio Chat | Lista de keywords temáticas | Enriquecer con clasificación semántica futura |
| Emergencias | Respuestas específicas | Registro especial de alertas |
| Longitud Respuestas | Truncado `$MAX_ANSWER_LEN` | Añadir conteo tokens semánticos |

---

## 6. Estrategia de Extensión Recomendada
### Corto Plazo
- Persistencia real para mascotas/recordatorios (tabla `pets`, `reminders`).
- Página detalle blog dinámica (`blog-detalle.php`).
- Sistema de categorías calculadas (contadores dinámicos en blog).

### Medio Plazo
- Rol de administrador: CRUD artículos desde panel privado.
- Cache HTML + ETag para artículos populares.
- RSS/Atom feed autogenerado.

### Largo Plazo
- Integración LLM segura (si se añaden claves a entorno). 
- Sistema de notificaciones push (Service Worker ampliado).
- Internacionalización (i18n) con diccionarios JSON.

---

## 7. Variables de Entorno (Servidor Node Opcional)
| Variable | Descripción | Obligatoria | Ejemplo |
|----------|-------------|------------|---------|
| `PORT` | Puerto de escucha | No | 3000 |
| `OPENAI_API_KEY` | Clave OpenAI para modo LLM | No | sk-xxxxx |
| `OPENAI_MODEL` | Modelo a usar | No | gpt-4o-mini |
| `AZURE_OPENAI_API_KEY` | Clave Azure OpenAI | No | xxxx |
| `AZURE_OPENAI_ENDPOINT` | Endpoint base | No | https://xxx.openai.azure.com |
| `AZURE_OPENAI_DEPLOYMENT` | Nombre despliegue | No | gpt4o-mini |
| `BLOG_FEED_URL` | Feed externo para blog | No | https://dominio/feed.json |

---

## 8. Ejecución / Desarrollo
### PHP + Apache / XAMPP
1. Colocar el proyecto dentro de `htdocs`.
2. Acceder vía `http://localhost/Alaska-1/`.
3. Asegurar permisos de escritura en carpeta `logs/`.

### Node (modo alternativo)
```bash
npm install
npm run dev   # con nodemon
# o
npm start
```
Abrir `http://localhost:3000/`.

---

## 9. Diseño de Código (Pautas Adoptadas)
- Cohesión funcional: cada clase controla una sola vista (Blog, Dashboard, ChatWidget implícito).
- Evitación de dependencias globales pesadas; uso de módulos nativos y fetch API.
- Progresivamente degradable: si falla el backend del chatbot, mensaje amigable y continuidad del resto.
- Inline bundling manual para reducir latencia inicial (blog/dashboard self-contained). 

---

## 10. Registro de Cambios Relevantes (Resumen Reciente)
| Cambio | Motivo | Impacto |
|--------|--------|---------|
| Inlining blog.js + artículos | Portabilidad y reducción de peticiones | Blog funciona offline básico |
| Inlining dashboard.js | Simplificar despliegue | Menos archivos a versionar en cliente |
| Creación endpoint chatbot con rate limiting | Seguridad y control de abuso | Previene spam y uso malicioso |
| Extensión KB chatbot (categorías) | Mejorar cobertura temática | Respuestas más contextualizadas |
| Logging JSON por interacción | Auditoría y depuración | Permite análisis posterior |

---

## 11. Mantenimiento y Buenas Prácticas
- Evitar editar directamente código inline largo sin comentarios: mantener bloques marcados con encabezados.
- Si se reintroduce fetch externo para escalabilidad, separar nuevamente en módulos (`/js` o `/src`).
- Validar siempre entradas de formularios en backend al formalizar persistencia.

---

## 12. Glosario Rápido
| Término | Definición |
|---------|-----------|
| KB | Knowledge Base: colección de patrones y respuestas predefinidas |
| Rate Limiting | Restricción de frecuencia de peticiones por IP |
| Self-contained | Archivo que incluye estructura + lógica + (opcionalmente) datos |
| Fallback | Mecanismo alterno cuando falla el primario |

---

## 13. Próximos Pasos Sugeridos (Roadmap Breve)
1. Implementar persistencia real (MySQL) de mascotas y recordatorios.
2. Añadir capa de sanitización global (helper PHP + funciones JS). 
3. Construir panel admin para CRUD de artículos.
4. Generar reporte de uso del chatbot (scripts de análisis de `logs/chatbot.log`).
5. Agregar test unitarios (Jest para lógica JS pura; PHPUnit si se escala backend PHP).

---

## 14. Créditos
- Equipo base: “Alaska Team”.
- Tecnologías: PHP, JavaScript (Vanilla), Node/Express opcional, HTML5/CSS3.

---

> Actualiza este documento cada vez que: (a) se agregue un nuevo módulo significativo, (b) se modifique el flujo de autenticación, (c) cambie la estrategia de datos, o (d) se integre un proveedor externo.

---

## 15. Sistema de Diseño (Armonización Reciente)

Objetivo: Modernizar UI sin saturación visual manteniendo el verde institucional como color primario y usando el naranja sólo como acento moderado.

Principios adoptados:
- Jerarquía cromática: Verde primario (fundacional) > Neutros (fondos y superficies) > Naranja solo para estados interactivos/acento puntual.
- Menos capas visuales: Reducción de overlays, brillos y halos para mejorar legibilidad.
- Consistencia de radios: 18–30px en contenedores principales; 14–18px en tarjetas secundarias.
- Sombra única controlada: Preferencia por 1–2 capas suaves en lugar de múltiples glows.
- Movimiento sutil: Hover = elevación ligera/traslación discreta (<6px) sin escalas abruptas.

Tokens sugeridos (candidatos a consolidar en futura refactorización):
```
--surface-glass-soft: rgba(255,255,255,0.75);
--surface-glass-medium: rgba(255,255,255,0.60);
--elevation-sm: 0 4px 12px -6px rgba(0,0,0,.18);
--elevation-md: 0 8px 22px -10px rgba(0,0,0,.28);
--focus-outline: 0 0 0 3px rgba(91,140,90,0.35);
```

Patrones consistentes:
- Cabecera sobria: degradado profundo en gama verde, sin brillos radiales.
- Tarjetas: fondo translúcido claro + borde tenue + sombra contenida.
- Botones primarios: degradado verde vertical leve; sin efectos multicolor.
- Paginación / chips: reducción de contraste hasta la interacción (hover/focus).

Accesibilidad:
- Contrast ratio > 4.5:1 en texto primario sobre fondos translucidos.
- Hover/focus no rely sólo en color (elevación o subrayado leve en enlaces).

## 16. Refinamiento de Modo Oscuro

Metas: Evitar negros planos, reducir “glare” en superficies translúcidas y mantener legibilidad de tipografías medias.

Lineamientos aplicables (a implementar gradualmente):
1. Reemplazar fondos absolutos por escalas: `#121614`, `#1c221f`, `#242d29`.
2. Ajustar opacidades de paneles glass: multiplicar por ~0.85 respecto a claro para evitar velo lechoso.
3. Sustituir naranja saturado en grandes bloques por un acento más tenue (`#ff865f` en hover, base en #ff7a53 reducido 10%).
4. Foco visible: anillo verde translúcido + contorno interno claro.
5. Iconografía: invertir sólo cuando el contraste caiga por debajo de 3:1.

Checklist pendiente para completar modo oscuro consistente:
- [ ] Unificar variables dark en `:root[data-theme='dark']` central (actualmente dispersas).
- [ ] Revisar contraste de `.stat-card` y `.blog-article` en fondos oscuros.
- [ ] Ajustar botones secundarios (borde + fill en hover) para evitar grises lavados.
- [ ] Validar contrastes con herramienta (Lighthouse / axe) antes de cierre.

## 17. Próximos Ajustes Recomendados de UI
1. Extraer gradientes repetidos a un módulo `design-tokens.css`.
2. Reducir variaciones de sombras a: `--shadow-sm`, `--shadow-md`, `--shadow-lg` reales.
3. Eliminar comentarios obsoletos de migración (ej: referencias a bloques movidos) en CSS.
4. Convertir componentes (tarjetas, modales, chips) en clases utilitarias reutilizables.
5. Añadir documentación visual (capturas antes/después) en una wiki opcional.

---

Actualización de armonización visual aplicada: 2025-09-11.

