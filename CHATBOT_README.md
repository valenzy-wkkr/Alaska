# Chat AIBot Alaska

Asistente conversacional especializado en cuidado, bienestar y ética de animales. Implementado con un widget JavaScript ligero en el frontend (`utils/chatbot.js`) y un endpoint backend en PHP (`api/chat/index.php`). No usa modelos externos por ahora: responde mediante reglas, detección semántica básica y una base de conocimiento ampliada.

## Objetivos
- Ofrecer orientación educativa rápida sobre alimentación, vacunación, higiene, bienestar emocional, primeros auxilios básicos y ética.
- Prevenir respuestas dañinas (rechaza maltrato o acciones peligrosas).
- Dirigir a un profesional veterinario ante emergencias o límites del asesoramiento.
- Mantener el dominio temático: niega preguntas fuera del ámbito animal / bienestar.

## Estructura de archivos
```
api/chat/index.php     # Endpoint principal (POST JSON {question})
utils/chatbot.js       # Widget incrustable en páginas (botón flotante + panel)
logs/chatbot.log       # Registros rotativos (uno por línea JSON)
logs/chat_rate_*.json  # Archivos de ventana deslizante para rate limit por IP
CHATBOT_README.md      # Este documento
```

## Flujo de funcionamiento
1. Usuario abre el widget (botón flotante 💬).
2. Escribe una pregunta -> se envía POST `/api/chat` con `{question:"..."}`.
3. El backend:
   - Aplica limitación: 10 peticiones / 60 s / IP.
   - Clasifica intención y valida dominio.
   - Filtra patrones de daño / emergencia.
   - Busca coincidencias en la base de conocimiento (scoring simple por keywords).
   - Devuelve JSON: `answer`, `category`, `disclaimer`, `rate_limit_remaining`.
4. Frontend muestra la respuesta y meta-información. Si 429 (rate limit) avisa al usuario.
5. Botón “Limpiar” reinicia la conversación (solo en UI; el servidor es stateless salvo logs).

## Seguridad y Controles
| Aspecto | Implementación |
|---------|----------------|
| Dominio temático | Lista de palabras clave para aceptar animales / cuidado |
| Contenido dañino | Expresiones regex (maltrato, violencia, dopaje) -> rechazo |
| Emergencias | Patrones (convulsión, no respira, sangrado abundante…) -> mensaje urgente |
| Rate limiting | Archivos JSON por IP, ventana deslizante (10/min) |
| Logging | Línea JSON por interacción (`ts`,`ip`,`q`,`a` truncada 300 chars) |
| Longitud respuesta | Corte a 1000 caracteres máximo |
| Sin eco de entrada | No se devuelve la pregunta del usuario (mitiga inyección) |
| Disclaimer | Añadido en todas las respuestas educativas |

## Categorías de Respuesta
`seguridad`, `emergencia`, `fuera_dominio`, `alimentacion`, `vacunacion`, `parasitologia`, `higiene`, `bienestar`, `primeros_auxilios`, `alarma`, `zoonosis`, `esterilizacion`, `geriatria`, `toxicidad`, `general`, `habitats`, `adaptaciones`, `alimentacion_naturaleza`, `conservacion`, `responsabilidad`, `etica_legal`, `impacto`, `educacion`, `adopcion`, `curiosidades`, `records`, `extinciones`, `historia`, `tendencias`, `generico`.

## Extender Base de Conocimiento
Cada entrada: `[ [keywords...], categoria, "respuesta breve" ]`.
Agregar al arreglo `$kb` en `api/chat/index.php`. Mantener respuestas:
- Neutras, educativas, sin diagnóstico definitivo.
- < 400 caracteres idealmente.

## Ejemplo de petición
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"question":"Calendario vacunas perro"}' \
  http://localhost/api/chat/
```
Respuesta:
```json
{
  "answer": "Perros: 6-8 sem (moquillo/parvo), 10-12 refuerzo, 14-16 refuerzo + rabia (según zona). Refuerzos anuales o según riesgo.",
  "category": "vacunacion",
  "disclaimer": "Información educativa. No reemplaza evaluación veterinaria profesional.",
  "rate_limit_remaining": 9
}
```

## Modos de error
| Código | Caso | Mensaje |
|--------|------|---------|
| 400 | Entrada vacía | `{"error":"Pregunta vacía"}` |
| 429 | Exceso de peticiones | Indica segundos de espera |
| 500 | (No implementado aún) | Para errores inesperados se puede añadir try/catch |

## Personalización Frontend
En `utils/chatbot.js` puedes ajustar:
- Colores (`.alaska-chatbot__btn`, gradiente header).
- Chips de sugerencias iniciales.
- Texto de bienvenida.

## Eliminar o Reducir Logs
Desactivar logging: poner `$LOG_ENABLED = false;` en el endpoint.
Rotación manual: vaciar `logs/chatbot.log` (no se sobrescribe si existe).

## Próximas Mejores Opcionales
1. Almacenamiento en DB (tabla `chat_logs`) para analítica.
2. Resumen de sesión (no se guarda el contexto ahora, cada mensaje es independiente).
3. Integrar un modelo LLM real (con capa de moderación previa) manteniendo filtros actuales.
4. Cache en memoria (APCu) de respuestas muy frecuentes.
5. Internacionalización (ES / EN) vía parámetro `lang`.
6. Pruebas unitarias simples para la función de clasificación.

## Advertencia Ética
El bot no reemplaza a un veterinario. Ante duda siempre derivar. Cumple propósito educativo y de bienestar.

## Changelog resumido
- v1: Widget con fallback local.
- v2: Endpoint backend + rate limit + logging + base de conocimiento extendida + botón limpiar + eliminación fallback local.

---
© 2025 Alaska – Uso interno / educativo.
