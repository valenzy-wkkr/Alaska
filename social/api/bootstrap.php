<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../php/conexion.php';
// Seguridad básica: verificar sesión
if(!isset($_SESSION['usuario_id'])){ http_response_code(401); echo json_encode(['success'=>false,'error'=>'auth']); exit; }
$userId = (int)$_SESSION['usuario_id'];
$userRole = $_SESSION['role'] ?? 'user';

function json_input(){
  $raw = file_get_contents('php://input');
  if(!$raw) return [];
  $d = json_decode($raw, true); return is_array($d)? $d: [];
}
function sanitize_text($t){ return trim(filter_var($t, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES)); }
function limit_len($t,$max){ return mb_substr($t,0,$max); }
function success($data=[]){ echo json_encode(['success'=>true,'data'=>$data]); exit; }
function fail($msg='error',$code=400,$extra=null){ http_response_code($code); $payload=['success'=>false,'error'=>$msg]; if($extra) $payload['meta']=$extra; echo json_encode($payload); exit; }

// Rate limit (simple por IP / acción) - memoria de sesión
function rate_limit($key,$limit,$seconds){
  $k = '_rl_'.$key; $now=time();
  if(!isset($_SESSION[$k])) $_SESSION[$k]=[];
  $_SESSION[$k] = array_filter($_SESSION[$k], fn($ts)=> ($now-$ts) < $seconds);
  if(count($_SESSION[$k]) >= $limit) fail('rate_limited',429,['retry_in'=>$seconds - ($now - min($_SESSION[$k]))]);
  $_SESSION[$k][]=$now;
}
