<?php
/**
 * API de autenticación para el panel admin (etapa 1: Login real + RBAC).
 * Requisitos previos:
 *  - Tabla usuarios con columnas: id, correo, password (hash), role (admin|moderator|editor|user), status (active|suspended)
 *  - Passwords almacenados con password_hash
 *  - Este endpoint retorna JWT para usar desde React Admin.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }

require_once __DIR__ . '/../php/conexion.php';

// Config secreta — mover a .env fuera de repositorio en producción
$JWT_SECRET = getenv('ADMIN_JWT_SECRET') ?: 'dev-secret-change';

// Implementación mínima JWT HS256 sin librerías externas
function b64url($d){ return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
function jwt_encode(array $payload, string $secret, int $ttlSeconds = 28800): string { // 8h
    $header = ['alg'=>'HS256','typ'=>'JWT'];
    $now = time();
    $payload['iat']=$now; $payload['exp']=$now+$ttlSeconds;
    $seg = b64url(json_encode($header)).'.'.b64url(json_encode($payload));
    $sig = hash_hmac('sha256', $seg, $secret, true);
    return $seg.'.'.b64url($sig);
}

// Sanitizar entrada simple
function in_str($k){ return trim($_POST[$k] ?? ''); }

if($_SERVER['REQUEST_METHOD']!=='POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'method_not_allowed']); exit; }

$correo = in_str('correo');
$password = in_str('password');
if($correo==='' || $password==='') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'missing_fields']); exit; }

$stmt = $conexion->prepare('SELECT id, correo, password, role, status, nombre FROM usuarios WHERE correo=? LIMIT 1');
$stmt->bind_param('s',$correo); $stmt->execute(); $res = $stmt->get_result();
$user = $res->fetch_assoc();
if(!$user){ http_response_code(401); echo json_encode(['ok'=>false,'error'=>'invalid_credentials']); exit; }
if(!password_verify($password, $user['password'])) { http_response_code(401); echo json_encode(['ok'=>false,'error'=>'invalid_credentials']); exit; }
if(($user['status'] ?? 'active') !== 'active') { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'user_inactive']); exit; }
if(!in_array($user['role'], ['admin','moderator','editor'])) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'role_forbidden']); exit; }

$token = jwt_encode([ 'sub'=>$user['id'], 'role'=>$user['role'] ], $JWT_SECRET);
echo json_encode([
  'ok'=> true,
  'token'=> $token,
  'role'=> $user['role'],
  'user'=> [ 'id'=>$user['id'],'nombre'=>$user['nombre'],'correo'=>$user['correo'] ]
]);
