<?php
/**
 * ADMIN API - Citas
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','moderator','editor']);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
@mysqli_query($conexion,"CREATE TABLE IF NOT EXISTS citas (id INT AUTO_INCREMENT PRIMARY KEY, mascota_id INT NOT NULL, usuario_id INT NOT NULL, fecha DATE NOT NULL, hora TIME NOT NULL, motivo VARCHAR(255) NULL, estado VARCHAR(30) NOT NULL DEFAULT 'programada', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
function j($c,$d){ http_response_code($c); echo json_encode($d); exit; }
function g($k,$d=''){ return trim($_POST[$k] ?? $d); }
if($_SERVER['REQUEST_METHOD']==='GET') {
  $page=max(1,(int)($_GET['page']??1)); $limit=min(100,max(1,(int)($_GET['limit']??50))); $off=($page-1)*$limit; $q=trim($_GET['q']??'');
  $where='WHERE 1=1'; $params=[];$types='';
  if($q!==''){ $where.=' AND (c.motivo LIKE ? OR u.correo LIKE ? OR m.nombre LIKE ?)'; $like='%'.$q.'%'; $params[]=$like;$params[]=$like;$params[]=$like;$types.='sss'; }
  $sql="SELECT SQL_CALC_FOUND_ROWS c.id, c.fecha, c.hora, c.motivo, c.estado, u.correo owner_correo, m.nombre mascota_nombre FROM citas c JOIN usuarios u ON u.id=c.usuario_id JOIN mascotas m ON m.id=c.mascota_id $where ORDER BY c.fecha DESC, c.hora DESC LIMIT ? OFFSET ?";
  $params[]=$limit; $params[]=$off; $types.='ii';
  $st=$conexion->prepare($sql); if($params) $st->bind_param($types,...$params); $st->execute(); $r=$st->get_result(); $items=[]; while($row=$r->fetch_assoc()) $items[]=$row; $total=(int)mysqli_fetch_assoc(mysqli_query($conexion,'SELECT FOUND_ROWS() t'))['t'];
  j(200,['ok'=>true,'items'=>$items,'meta'=>['total'=>$total,'page'=>$page,'pages'=>max(1,ceil($total/$limit))]]);
}
if($_SERVER['REQUEST_METHOD']==='POST') {
  $action=g('action','create');
  if($action==='create') {
    $mascota_id=(int)($_POST['mascota_id']??0); $usuario_id=(int)($_POST['usuario_id']??0); $fecha=g('fecha'); $hora=g('hora'); $motivo=g('motivo');
    if(!$mascota_id||!$usuario_id||!$fecha||!$hora) j(400,['ok'=>false,'error'=>'missing_fields']);
    $st=$conexion->prepare('INSERT INTO citas (mascota_id,usuario_id,fecha,hora,motivo) VALUES (?,?,?,?,?)'); $st->bind_param('iisss',$mascota_id,$usuario_id,$fecha,$hora,$motivo); if(!$st->execute()) j(500,['ok'=>false,'error'=>'db']);
    j(201,['ok'=>true,'id'=>$conexion->insert_id]);
  }
  $id=(int)($_POST['id']??0); if($id<=0) j(400,['ok'=>false,'error'=>'missing_id']);
  if($action==='update') {
    $fecha=g('fecha'); $hora=g('hora'); $motivo=g('motivo'); $estado=g('estado','programada');
    $st=$conexion->prepare('UPDATE citas SET fecha=?, hora=?, motivo=?, estado=? WHERE id=? LIMIT 1'); $st->bind_param('ssssi',$fecha,$hora,$motivo,$estado,$id); $st->execute(); j(200,['ok'=>true]);
  }
  if($action==='cancel') { $st=$conexion->prepare('UPDATE citas SET estado="cancelada" WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  if($action==='complete') { $st=$conexion->prepare('UPDATE citas SET estado="completada" WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  if($action==='delete') { $st=$conexion->prepare('DELETE FROM citas WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  j(400,['ok'=>false,'error'=>'unknown_action']);
}
j(405,['ok'=>false,'error'=>'method_not_allowed']);
