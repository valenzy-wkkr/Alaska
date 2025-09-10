<?php
/**
 * ADMIN API - Mascotas
 * GET listado (?q & page & limit)
 * POST create/update/delete
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','moderator','editor']);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
@mysqli_query($conexion,"CREATE TABLE IF NOT EXISTS mascotas (id INT AUTO_INCREMENT PRIMARY KEY, usuario_id INT NOT NULL, nombre VARCHAR(120) NOT NULL, especie VARCHAR(60) NOT NULL, raza VARCHAR(120) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
function jx($c,$d){ http_response_code($c); echo json_encode($d); exit; }
function s($k,$d=''){ return trim($_POST[$k] ?? $d); }

if($_SERVER['REQUEST_METHOD']==='GET') {
  $page=max(1,(int)($_GET['page']??1)); $limit=min(100,max(1,(int)($_GET['limit']??50))); $off=($page-1)*$limit; $q=trim($_GET['q']??'');
  $where='WHERE 1=1'; $params=[]; $types='';
  if($q!==''){ $where.=' AND (m.nombre LIKE ? OR m.especie LIKE ? OR u.correo LIKE ?)'; $like='%'.$q.'%'; $params[]=$like;$params[]=$like;$params[]=$like;$types.='sss'; }
  $sql="SELECT SQL_CALC_FOUND_ROWS m.id,m.nombre,m.especie,m.raza,u.correo dueno_correo FROM mascotas m JOIN usuarios u ON u.id=m.usuario_id $where ORDER BY m.id DESC LIMIT ? OFFSET ?";
  $params[]=$limit; $params[]=$off; $types.='ii';
  $st=$conexion->prepare($sql); if($params) $st->bind_param($types,...$params); $st->execute(); $r=$st->get_result(); $items=[]; while($row=$r->fetch_assoc()) $items[]=$row; $total=(int)mysqli_fetch_assoc(mysqli_query($conexion,'SELECT FOUND_ROWS() t'))['t'];
  jx(200,['ok'=>true,'items'=>$items,'meta'=>['total'=>$total,'page'=>$page,'pages'=>max(1,ceil($total/$limit))]]);
}
if($_SERVER['REQUEST_METHOD']==='POST') {
  $action=s('action','create');
  if($action==='create') {
    $usuario_id=(int)($_POST['usuario_id']??0); $nombre=s('nombre'); $especie=s('especie'); $raza=s('raza');
    if($usuario_id<=0||$nombre==='') jx(400,['ok'=>false,'error'=>'missing_fields']);
    $st=$conexion->prepare('INSERT INTO mascotas (usuario_id,nombre,especie,raza) VALUES (?,?,?,?)'); $st->bind_param('isss',$usuario_id,$nombre,$especie,$raza); if(!$st->execute()) jx(500,['ok'=>false,'error'=>'db']);
    jx(201,['ok'=>true,'id'=>$conexion->insert_id]);
  }
  if($action==='update') {
    $id=(int)($_POST['id']??0); if($id<=0) jx(400,['ok'=>false,'error'=>'missing_id']);
    $nombre=s('nombre'); $especie=s('especie'); $raza=s('raza');
    $st=$conexion->prepare('UPDATE mascotas SET nombre=?, especie=?, raza=? WHERE id=? LIMIT 1'); $st->bind_param('sssi',$nombre,$especie,$raza,$id); $st->execute(); jx(200,['ok'=>true]);
  }
  if($action==='delete') { $id=(int)($_POST['id']??0); if($id<=0) jx(400,['ok'=>false,'error'=>'missing_id']); $st=$conexion->prepare('DELETE FROM mascotas WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); jx(200,['ok'=>true]); }
  jx(400,['ok'=>false,'error'=>'unknown_action']);
}
jx(405,['ok'=>false,'error'=>'method_not_allowed']);
