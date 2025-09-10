<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../config/openai_config.php';
require_once __DIR__ . '/../lib/OpenAIClient.php';
require_once __DIR__ . '/../lib/RateLimiter.php';

if (OPENAI_API_KEY === 'PON_TU_API_KEY_AQUI') {
    http_response_code(500);
    echo json_encode(['error' => 'API Key no configurada']);
    exit;
}

$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
$question = trim($json['question'] ?? '');
if ($question === '' || mb_strlen($question) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'Pregunta inválida']);
    exit;
}
if (mb_strlen($question) > 600) {
    $question = mb_substr($question, 0, 600);
}

// Filtro básico de contenido médico / emergencia
$medicalRx = '/(medic|tratam|cirug|recet|pastilla|inyecci|urgenc|hospital|veterinari|enfermedad|sintom|fármaco|farmaco|remedio|cura|diagnóstic|diagnostic|prescrip|anestesi|antibiótic|antibiotic|analgésic|analgesic|antiinflamatorio|vacuna|desparasit|parásito|parasito|pulga|garrapata|vomito|diarrea|sangrado|fractura|convulsion|convulsión|herida|dolor|malestar|emergencia|consulta)/i';
if (preg_match($medicalRx, $question)) {
    echo json_encode(['answer' => 'No puedo brindar diagnósticos ni consejos médicos. Ante cualquier síntoma o urgencia, consulta a un veterinario profesional.']);
    exit;
}

// Rate limit por IP (hash para no guardar IP directa)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ipHash = substr(sha1($ip), 0, 12);
$rateLimiter = new RateLimiter(__DIR__ . '/../logs/ratelimit.json', 40);
if (!$rateLimiter->allow($ipHash)) {
    http_response_code(429);
    echo json_encode(['error' => 'Límite diario alcanzado (40). Intenta mañana.']);
    exit;
}

$client = new OpenAIClient(OPENAI_API_KEY, OPENAI_MODEL);
$result = $client->chat($question);

// Logging
@mkdir(__DIR__ . '/../logs', 0775, true);
$logLine = date('Y-m-d H:i:s') . '|' . $ipHash . '|';
if ($result['ok']) {
    $logLine .= 'OK|' . str_replace(["\n", "\r", '|'], ' ', mb_substr($question, 0, 80));
} else {
    $logLine .= 'ERR:' . ($result['error'] ?? 'unknown') . '|' . str_replace(["\n", "\r", '|'], ' ', mb_substr($question, 0, 80));
}
file_put_contents(__DIR__ . '/../logs/chat_log.txt', $logLine . "\n", FILE_APPEND);

if (!$result['ok']) {
    http_response_code(500);
    echo json_encode(['error' => 'Fallo al obtener respuesta.']);
    exit;
}

// Respuesta final con recordatorio de seguridad adjunto
$finalAnswer = $result['answer'] . "\n\n⚠️ Recuerda: esto es información educativa. Para diagnósticos o tratamientos acude a un veterinario certificado.";
echo json_encode(['answer' => $finalAnswer]);
