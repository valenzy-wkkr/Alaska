<?php
/**
 * ADMIN API - Usuarios
 * Métodos:
 *  GET  -> listado paginado + filtros (?q=&page=&limit=)
 *  POST action=create -> crear usuario (admin)
 *  POST action=update -> actualizar nombre/apodo/role/status (admin)
 *  POST action=suspend|activate -> cambiar status (admin)
 *  POST action=role -> cambiar rol (admin)
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','moderator']);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }

// Asegurar columnas opcionales
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'");
@mysqli_query($conexion, "ALTER TABLE usuarios ADD COLUMN deleted_at DATETIME NULL");

function jexit($code,$arr){ http_response_code($code); echo json_encode($arr); exit; }
function str($k,$d=''){ return trim($_POST[$k] ?? $d); }

if($_SERVER['REQUEST_METHOD']==='GET') {
    $q = trim($_GET['q'] ?? '');
    $page = max(1,(int)($_GET['page'] ?? 1));
    $limit = min(100, max(1,(int)($_GET['limit'] ?? 50)));
    $offset = ($page-1)*$limit;
    $where = 'WHERE deleted_at IS NULL';
    $params=[]; $types='';
    if($q!=='') { $where .= ' AND (correo LIKE ? OR nombre LIKE ? OR apodo LIKE ?)'; $like='%'.$q.'%'; $params[]=$like; $params[]=$like; $params[]=$like; $types.='sss'; }
    $sql = "SELECT SQL_CALC_FOUND_ROWS id, correo, nombre, apodo, role, status, last_login FROM usuarios $where ORDER BY id DESC LIMIT ? OFFSET ?";
    $params[]=$limit; $params[]=$offset; $types.='ii';
    $stmt = $conexion->prepare($sql);
    if($params) $stmt->bind_param($types,...$params);
    $stmt->execute(); $res = $stmt->get_result();
    $items=[]; while($r=$res->fetch_assoc()) $items[]=$r;
    $total = (int)mysqli_fetch_assoc(mysqli_query($conexion,'SELECT FOUND_ROWS() t'))['t'];
    jexit(200,[ 'ok'=>true,'items'=>$items,'meta'=>['total'=>$total,'page'=>$page,'pages'=>max(1,ceil($total/$limit))] ]);
}

if($_SERVER['REQUEST_METHOD']==='POST') {
    if($auth['role']!=='admin') jexit(403,['ok'=>false,'error'=>'only_admin']);
    $action = str('action');
    if($action==='create') {
        $correo = str('correo'); $password = str('password'); $role = str('role','user');
        if(!filter_var($correo,FILTER_VALIDATE_EMAIL)) jexit(400,['ok'=>false,'error'=>'bad_email']);
        if(strlen($password)<6) jexit(400,['ok'=>false,'error'=>'short_password']);
        if(!in_array($role,['user','admin','moderator','editor'])) $role='user';
        $stmt = $conexion->prepare('SELECT id FROM usuarios WHERE correo=? LIMIT 1');
        $stmt->bind_param('s',$correo); $stmt->execute(); $r=$stmt->get_result(); if($r->num_rows>0) jexit(409,['ok'=>false,'error'=>'exists']);
        $hash = password_hash($password,PASSWORD_DEFAULT);
        $stmt = $conexion->prepare('INSERT INTO usuarios (correo, clave, role, status) VALUES (?,?,?,"active")');
        $stmt->bind_param('sss',$correo,$hash,$role);
        if(!$stmt->execute()) jexit(500,['ok'=>false,'error'=>'db']);
        jexit(201,['ok'=>true,'id'=>$conexion->insert_id]);
    }
    $id = (int)($_POST['id'] ?? 0); if($id<=0) jexit(400,['ok'=>false,'error'=>'missing_id']);
    if($action==='suspend') {
        $st=$conexion->prepare('UPDATE usuarios SET status="suspended" WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); jexit(200,['ok'=>true]);
    }
    if($action==='activate') {
        $st=$conexion->prepare('UPDATE usuarios SET status="active" WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); jexit(200,['ok'=>true]);
    }
    if($action==='role') {
        $role = str('role'); if(!in_array($role,['user','admin','moderator','editor'])) jexit(400,['ok'=>false,'error'=>'bad_role']);
        $st=$conexion->prepare('UPDATE usuarios SET role=? WHERE id=? LIMIT 1'); $st->bind_param('si',$role,$id); $st->execute(); jexit(200,['ok'=>true]);
    }
    if($action==='delete') { $st=$conexion->prepare('UPDATE usuarios SET deleted_at=NOW() WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); jexit(200,['ok'=>true]); }
    if($action==='update') {
        $nombre = str('nombre',null); $apodo = str('apodo',null);
        $st=$conexion->prepare('UPDATE usuarios SET nombre=?, apodo=? WHERE id=? LIMIT 1'); $st->bind_param('ssi',$nombre,$apodo,$id); $st->execute(); jexit(200,['ok'=>true]);
    }
    jexit(400,['ok'=>false,'error'=>'unknown_action']);
}

jexit(405,['ok'=>false,'error'=>'method_not_allowed']);
