<?php
/**
 * ======================================================================
 * Middleware compartido para la API de administración.
 * ----------------------------------------------------------------------
 * Responsabilidades:
 *  - Cargar la conexión a la base de datos (para endpoints que la necesiten)
 *  - Decodificar y validar JSON Web Tokens firmados con HS256
 *  - Verificar control de acceso basado en roles (RBAC) en cada endpoint
 *  - Unificar respuestas JSON de error/salida temprana
 *
 * NOTAS DE SEGURIDAD:
 *  - La clave ($JWT_SECRET) debe almacenarse fuera del repositorio (.env)
 *  - El tiempo de expiración se valida; si exp < now el token se rechaza
 *  - Se usa hash_equals para evitar ataques de timing al comparar firmas
 *  - Si se ampliara a refresco de tokens, aquí podría agregarse lógica extra
 * ======================================================================
 */
require_once __DIR__ . '/../php/conexion.php';

// Clave secreta para firmar tokens (en producción usar variable de entorno).
$JWT_SECRET = getenv('ADMIN_JWT_SECRET') ?: 'dev-secret-change';

/**
 * Decodifica Base64URL → binario.
 * Corrige padding faltante y reemplaza caracteres url-safe
 */
function b64url_dec(string $d): string|false {
    $r = strtr($d,'-_','+/');
    $p = strlen($r)%4;
    if($p){ $r.=str_repeat('=', 4-$p); }
    return base64_decode($r);
}

/**
 * Decodifica un JWT HS256 y valida firma y expiración.
 * Devuelve el payload (array) o null si no es válido.
 */
function jwt_decode(string $jwt, string $secret): ?array {
    $parts = explode('.', $jwt);
    if(count($parts)!==3) return null; // Estructura incorrecta
    [$h,$p,$s] = $parts;

    $header  = json_decode(b64url_dec($h), true);
    $payload = json_decode(b64url_dec($p), true);
    $sig     = b64url_dec($s);

    if(!$header || !$payload || $sig===false) return null; // JSON mal formado o base64 inválido
    if(($header['alg'] ?? '')!=='HS256') return null;      // Algoritmo no soportado / manipulado

    // Recalcular firma y comparar de forma segura
    $check = hash_hmac('sha256', $h.'.'.$p, $secret, true);
    if(!hash_equals($check,$sig)) return null;             // Firma inválida

    // Validar expiración (exp obligatorio en generación)
    if(($payload['exp'] ?? 0) < time()) return null;       // Token expirado

    return $payload;
}

/**
 * Salida JSON uniforme y finaliza ejecución.
 */
function admin_json(int $status, array $data): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Exige un token válido y que el rol del payload esté dentro de $roles permitidos.
 * Retorna el payload decodificado para que el endpoint pueda usar datos (sub, role...).
 */
function auth_require(array $roles): array {
    global $JWT_SECRET;
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if(!str_starts_with($hdr,'Bearer ')) {
        admin_json(401,['ok'=>false,'error'=>'no_token']);
    }
    $token = substr($hdr,7);
    $payload = jwt_decode($token, $JWT_SECRET);
    if(!$payload) {
        admin_json(401,['ok'=>false,'error'=>'bad_token']);
    }
    if(!in_array($payload['role'],$roles,true)) {
        admin_json(403,['ok'=>false,'error'=>'forbidden']);
    }
    return $payload; // Devuelve payload para uso en endpoint
}
