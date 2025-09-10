<?php
// Configuración de OpenAI
// 1) Coloca tu API Key abajo o configúrala como variable de entorno OPENAI_API_KEY
// 2) Opcional: define OPENAI_MODEL como variable de entorno para cambiar el modelo.

define('OPENAI_API_KEY', getenv('OPENAI_API_KEY') ?: 'PON_TU_API_KEY_AQUI'); // <-- Reemplaza si no usarás variable de entorno
define('OPENAI_MODEL', getenv('OPENAI_MODEL') ?: 'gpt-3.5-turbo');
define('OPENAI_TIMEOUT', 25); // segundos

if (OPENAI_API_KEY === 'PON_TU_API_KEY_AQUI') {
    // Aviso solo en modo desarrollo; en producción se puede desactivar.
    error_log('[AlaskaChat] Advertencia: No se ha configurado la API Key de OpenAI.');
}

// Prompt base para orientar el comportamiento del asistente.
define('OPENAI_SYSTEM_PROMPT', 'Eres Alaska, un asistente virtual que ofrece información general y educativa sobre el cuidado responsable de mascotas. NO das diagnósticos ni tratamientos médicos. Siempre recomiendas acudir a un veterinario ante síntomas, emergencias o dudas de salud. Estilo: claro, empático, conciso y en español neutro.');
