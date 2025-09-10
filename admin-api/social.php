<?php
/**
 * ADMIN API - Moderación Social
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','moderator']);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
function j($c,$d){ http_response_code($c); echo json_encode($d); exit; }
function s($k,$d=''){ return trim($_POST[$k] ?? $d); }
@mysqli_query($conexion,'ALTER TABLE social_posts ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0');
@mysqli_query($conexion,'ALTER TABLE social_comments ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0');

if($_SERVER['REQUEST_METHOD']==='GET') {
  $type = $_GET['type'] ?? 'posts';
  if($type==='posts') {
    $res = @mysqli_query($conexion,'SELECT p.id,p.user_id,p.content,p.created_at,p.is_hidden,(SELECT COUNT(*) FROM social_likes l WHERE l.post_id=p.id) likes,(SELECT COUNT(*) FROM social_comments c WHERE c.post_id=p.id) comments FROM social_posts p ORDER BY p.id DESC LIMIT 100');
    $items=[]; if($res) while($r=$res->fetch_assoc()) $items[]=$r; j(200,['ok'=>true,'items'=>$items]);
  }
  if($type==='reports') {
    $res = @mysqli_query($conexion,'SELECT id,target_type,target_id,user_id,reason,created_at FROM social_reports ORDER BY id DESC LIMIT 100'); $items=[]; if($res) while($r=$res->fetch_assoc()) $items[]=$r; j(200,['ok'=>true,'items'=>$items]);
  }
  if($type==='comments') {
    $res = @mysqli_query($conexion,'SELECT id,post_id,user_id,content,is_hidden,created_at FROM social_comments ORDER BY id DESC LIMIT 200'); $items=[]; if($res) while($r=$res->fetch_assoc()) $items[]=$r; j(200,['ok'=>true,'items'=>$items]);
  }
  j(400,['ok'=>false,'error'=>'bad_type']);
}
if($_SERVER['REQUEST_METHOD']==='POST') {
  $action=s('action'); $target=s('target'); $id=(int)($_POST['id']??0); if($id<=0) j(400,['ok'=>false,'error'=>'missing_id']);
  if($target==='post') {
    if($action==='hide'){ $st=$conexion->prepare('UPDATE social_posts SET is_hidden=1 WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
    if($action==='show'){ $st=$conexion->prepare('UPDATE social_posts SET is_hidden=0 WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
    if($action==='delete'){ $st=$conexion->prepare('DELETE FROM social_posts WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  }
  if($target==='comment') {
    if($action==='hide'){ $st=$conexion->prepare('UPDATE social_comments SET is_hidden=1 WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
    if($action==='show'){ $st=$conexion->prepare('UPDATE social_comments SET is_hidden=0 WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
    if($action==='delete'){ $st=$conexion->prepare('DELETE FROM social_comments WHERE id=?'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  }
  j(400,['ok'=>false,'error'=>'unknown_action']);
}
j(405,['ok'=>false,'error'=>'method_not_allowed']);
