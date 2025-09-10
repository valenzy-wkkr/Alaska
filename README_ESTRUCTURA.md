# Alaska - Guía de Estructura del Proyecto

Este documento complementa el `README.md` principal. Aquí se describe la organización REAL del repositorio actual (mixto PHP + JS) y la función de cada carpeta/archivo clave.

## Visión General
El proyecto combina varias capas:
- Frontend estático (HTML/CSS/JS vanilla) para páginas públicas y de usuario.
- Backend PHP clásico (sesiones, autenticación legacy, endpoints blog/social públicos y recuperación de contraseña).
- API admin en PHP con JWT y control de roles.
- Módulos sociales (posts, likes, comentarios) y blog con búsqueda (FULLTEXT si disponible) + RSS.
- Integración Chatbot / IA (cliente OpenAI y limitador de peticiones).
- Scripts/JS utilitarios y pequeñas vistas JS tipo componentes (no framework grande).

## Árbol Top-Level (simplificado)
```
Alaska-1/
  admin/              Panel HTML administrativo (interfaz manual)
  admin-api/          Endpoints PHP protegidos con JWT para administración (REST-like)
  admin-react/        (Placeholder / experimental) posible migración futura a React
  api/                Endpoints públicos ligeros (blog list/meta/post, RSS, chat)
  blog/               Página(s) frontend del blog
  config/             (Reservado / actualmente vacío o mínima config adicional)
  controllers/        Lógica JS (ej: UserController) para frontend/dashboard
  data/               Datos estáticos (ej: JSON inicial de artículos)
  includes/           Helpers reutilizables PHP (blog, chatbot)
  lib/                Librerías PHP de soporte (OpenAIClient, RateLimiter)
  php/                Scripts PHP legacy (login, registro, reset password, conexión BD)
  social/             Frontend + micro API específica social (subcarpeta api/)
  utils/              Utilidades JS (auth token storage, validator, logger, chatbot)
  views/              Componentes JS tipo vistas (no templating server-side real)
  uploads/            (Directorio destino para imágenes u otros assets subidos)
  logs/               Archivos de log (errores, auditoría futura)
  *.html / *.php      Páginas raíz públicas o de usuario (index, dashboard, etc.)
  server.js           Servidor Node (posible PWA / service worker support complementario)
  sw.js               Service Worker para caching / PWA
  manifest.webmanifest Metadatos PWA
```

## Carpetas en Detalle

### `admin/`
Panel clásico (no SPA) que:
- Asegura sesión y rol `admin` vía `$_SESSION`.
- Auto-crea tablas mínimas (`posts`, tablas sociales) para evitar fallos en instalaciones frescas.
- Archivos:
  - `index.php`: Dashboard métricas.
  - `users.php`, `blog_posts.php`, `blog_post_edit.php`, `reports.php`: Gestión manual.
  - `admin_boot.php`: Bootstrap común (si presente) para cargar dependencias.

### `admin-api/`
API administrativa protegida con JWT (middleware propio):
- `middleware.php`: Decodifica JWT HS256, verifica firmas, roles y ayuda a responder JSON estandarizado.
- `auth.php`: Emisión / validación de tokens (login admin API).
- `users.php`, `pets.php`, `appointments.php`: Recursos de dominio (CRUD o listado).
- `blog.php`: CRUD artículos blog.
- `social.php`: Moderación social (ocultar, listar reportes, etc.).
- `metrics.php`: Agregados/estadísticas (dashboards).
- `.htaccess`: Forzar headers / routing (si aplica en Apache).

### `api/`
Endpoints públicos (sin JWT admin) para consumo frontend:
- `blog_list.php`, `blog_meta.php`, `blog_post.php`: Listados y detalle utilizando `includes/blog_functions.php`.
- `blog_rss.php`: Genera feed RSS dinámico.
- `chat.php`: Pasarela hacia chatbot / IA (usa `lib/OpenAIClient.php`).

### `includes/`
Helpers PHP reutilizables:
- `blog_functions.php`: Lógica central de blog (paginación, filtros, fulltext, fallback JSON, caché simple, sanitización, migraciones silenciosas de columnas). Implementa detección de FULLTEXT y crea índice.
- `chatbot_include.php`: Bootstrap/helper para integrar chatbot (tokens, rate limiting, etc.).

### `php/`
Scripts legacy / flujo tradicional de auth y usuario:
- `conexion.php`: Conexión MySQL (utf8mb4, notas de endurecimiento).
- `validar_login.php`: Login + migraciones silenciosas columnas usuarios (role, status, last_login).
- `registro.php`: Registro básico de usuarios.
- `logout.php`: Cierra sesión limpia.
- `forgot_password_request.php`, `reset_password_process.php`, `forgot_password.php`, `reset_password.php`: Flujo de recuperación (tokens almacenados, expiración, actualización hash).
- `botonera.php`: Fragmento UI reutilizable.

### `social/`
Frontend social y micro-endpoints:
- `social.php`: Página principal social (timeline / interacción).
- `social.js`, `social.css`: Lógica e interfaz.
- `api/` (subcarpeta): endpoints CRUD rápidos (crear post, listar posts, crear comentario, toggle like). `bootstrap.php` maneja conexión y validaciones iniciales. `README.sql` puede contener esquema de tablas recomendado.

### `lib/`
Librerías PHP de soporte:
- `OpenAIClient.php`: Cliente simple para llamadas a API de IA (maneja headers, timeout, parsing JSON, errores).
- `RateLimiter.php`: Limitador de peticiones (memoria simple o estrategia basada en IP/llave) para proteger endpoints de abuso.

### `utils/` (JS)
Utilidades JavaScript compartidas (frontend):
- `auth.js`: Manejo de tokens/localStorage/sessionStorage.
- `storage.js`: Abstracción almacenamiento.
- `Validator.js`: Validaciones de formulario (email, contraseñas, campos requeridos).
- `Logger.js`: Logging cliente (niveles, formateo).
- `ErrorHandler.js`: Captura / muestra errores de forma consistente.
- `chatbot.js` y `ai-chatbot.js`: Interfaz conversacional y helpers UI para IA.

### `views/` (JS)
Pequeños componentes / vistas renderizadas en DOM:
- `FormView.js`, `ButtonView.js`, `MenuView.js`: Patrón lightweight para crear y manipular nodos UI.

### `controllers/`
- `UserController.js`: Orquesta operaciones de usuario en el dashboard (fetch datos, actualizar UI, etc.).

### `blog/`
HTML/JS/CSS específico para presentar contenido blog (puede consumir `api/blog_*`).

### `data/`
Datos estáticos (`blog-articles.json`) usados como fallback cuando la tabla `posts` no existe o está vacía.

### `uploads/`
Destino para archivos subidos (imágenes de posts/social). Recomendado proteger con validación MIME y limitar tamaño.

### `logs/`
Registro de incidencias / debug. Asegurar rotación y evitar exponer públicamente en producción.

## Mecanismos Clave
- Migraciones silenciosas: creación de tablas y columnas ausentes en runtime para reducir errores fatales en entornos recién montados.
- Cache (APCu / filesystem) en `blog_functions.php` para categorías y tags.
- Búsqueda: Uso de FULLTEXT (si disponible) y fallback a LIKE.
- Seguridad: Regeneración de sesión en login, JWT para admin, sanitización básica HTML en contenido blog, limitador de peticiones para chatbot.
- Fallback contenido: Si no existe tabla `posts`, se sirve JSON estático.

## Flujo de Autenticación
1. Usuario (legacy) usa `validar_login.php` -> establece `$_SESSION` + rol.
2. Admin API: se obtiene token JWT llamando a `admin-api/auth.php` (requiere credenciales). El token se envía en `Authorization: Bearer ...` para otros endpoints.

## Flujo Blog
1. Inputs llegan a endpoints `api/blog_list.php` etc.
2. Se consultan funciones en `includes/blog_functions.php`.
3. Si no hay DB lista -> fallback JSON.
4. Respuesta JSON para render dinámico.

## Flujo Social
1. Frontend `social.js` llama endpoints en `social/api/`.
2. `bootstrap.php` establece conexión y valida autenticación mínima (si aplica).
3. Se manipulan tablas `social_posts`, `social_comments`, `social_likes`.

## Chatbot / IA
- `api/chat.php` recibe prompt.
- Usa `lib/OpenAIClient.php` para enviar a proveedor IA.
- Aplica `RateLimiter.php` (IP / token) antes de procesar.
- Respuesta estructurada para UI (`chatbot.js`).

## Recomendaciones Pendientes
- Centralizar migraciones en script único versionado.
- Implementar CSP y cabeceras de seguridad (X-Content-Type-Options, etc.).
- Reemplazar sanitización HTML manual por librería robusta.
- Añadir tests automatizados (PHPUnit / Jest para JS). 
- Cifrar tokens reset con HMAC en vez de texto claro (si aún no). 
- Parametrizar secrets en `.env` (JWT key, API keys IA).

## Convenciones / Estilo
- Commit messages en español usando prefijos: `fix:`, `feat:`, `docs:`, `chore:`.
- Código PHP orientado a defensividad (prefijo @ en migraciones silenciosas). Evitar @ en lógica crítica normal.

## Cómo Empezar Rápido
1. Configura `.env` (DB credenciales, API keys IA si necesarias).
2. Asegura permisos escritura en `cache/`, `uploads/`, `logs/`.
3. Visita `/admin/` con un usuario admin (role='admin') para forzar auto-creación tablas.
4. Consume endpoints `api/blog_list.php` para validar blog.
5. Prueba flujo olvidar/reset password.

## Tabla de Referencia (Principales Tablas)
- `usuarios`: auth básica + role/status/last_login.
- `posts`: blog (title, slug, excerpt, content, category, tags, cover_image, status, published_at, author).
- `social_posts` / `social_comments` / `social_likes` / `social_reports`.
- `password_resets` (tokens de recuperación).

## Licencia
Ver `README.md` principal (MIT).

---
Este documento se mantendrá actualizado conforme se agreguen módulos o se consoliden migraciones.
