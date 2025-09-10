<?php
/**
 * ADMIN API - Blog CRUD básico
 */
require_once __DIR__ . '/middleware.php';
$auth = auth_require(['admin','editor']);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){ http_response_code(204); exit; }
function j($c,$d){ http_response_code($c); echo json_encode($d); exit; }
function s($k,$d=''){ return trim($_POST[$k] ?? $d); }

if($_SERVER['REQUEST_METHOD']==='GET') {
  $page=max(1,(int)($_GET['page']??1)); $limit=min(100,max(1,(int)($_GET['limit']??50))); $off=($page-1)*$limit; $q=trim($_GET['q']??''); $where='WHERE 1=1'; $params=[];$types='';
  if($q!==''){ $where.=' AND (title LIKE ? OR category LIKE ? OR tags LIKE ?)'; $like='%'.$q.'%'; $params[]=$like;$params[]=$like;$params[]=$like;$types.='sss'; }
  $sql="SELECT SQL_CALC_FOUND_ROWS id,title,slug,category,tags,status,published_at FROM posts $where ORDER BY published_at DESC LIMIT ? OFFSET ?"; $params[]=$limit;$params[]=$off;$types.='ii';
  $st=$conexion->prepare($sql); if($params) $st->bind_param($types,...$params); $st->execute(); $r=$st->get_result(); $items=[]; while($row=$r->fetch_assoc()) $items[]=$row; $total=(int)mysqli_fetch_assoc(mysqli_query($conexion,'SELECT FOUND_ROWS() t'))['t'];
  j(200,['ok'=>true,'items'=>$items,'meta'=>['total'=>$total,'page'=>$page,'pages'=>max(1,ceil($total/$limit))]]);
}
if($_SERVER['REQUEST_METHOD']==='POST') {
  $action=s('action','create');
  if($action==='create') {
    $title=s('title'); $content=$_POST['content'] ?? ''; $category=s('category','General'); $tags=s('tags'); $status=in_array(s('status','published'),['draft','published'])? s('status','published'):'published';
    if($title==='') j(400,['ok'=>false,'error'=>'missing_title']);
    $slugBase = preg_replace('/[^a-z0-9]+/','-', strtolower(iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$title))); $slugBase=trim($slugBase,'-'); if($slugBase==='') $slugBase='post'; $slug=$slugBase; $i=2; while(true){ $st=$conexion->prepare('SELECT id FROM posts WHERE slug=? LIMIT 1'); $st->bind_param('s',$slug); $st->execute(); $g=$st->get_result(); if($g->num_rows===0) break; $slug=$slugBase.'-'.$i++; if($i>40){ $slug=$slugBase.'-'.substr(sha1(uniqid('',true)),0,6); break; } }
    $excerpt=mb_substr(strip_tags($content),0,180);
    $st=$conexion->prepare('INSERT INTO posts (title,slug,excerpt,content,category,tags,status,published_at,author) VALUES (?,?,?,?,?,?,?,NOW(),?)'); $authorId=$auth['sub']; $st->bind_param('ssssssss',$title,$slug,$excerpt,$content,$category,$tags,$status,$authorId); if(!$st->execute()) j(500,['ok'=>false,'error'=>'db']); j(201,['ok'=>true,'id'=>$conexion->insert_id]);
  }
  $id=(int)($_POST['id']??0); if($id<=0) j(400,['ok'=>false,'error'=>'missing_id']);
  if($action==='update') { $title=s('title'); $content=$_POST['content'] ?? ''; $category=s('category'); $tags=s('tags'); $status=in_array(s('status'),['draft','published'])?s('status'):'published'; $excerpt=mb_substr(strip_tags($content),0,180); $st=$conexion->prepare('UPDATE posts SET title=?, category=?, tags=?, status=?, content=?, excerpt=? WHERE id=? LIMIT 1'); $st->bind_param('ssssssi',$title,$category,$tags,$status,$content,$excerpt,$id); $st->execute(); j(200,['ok'=>true]); }
  if($action==='delete') { $st=$conexion->prepare('DELETE FROM posts WHERE id=? LIMIT 1'); $st->bind_param('i',$id); $st->execute(); j(200,['ok'=>true]); }
  j(400,['ok'=>false,'error'=>'unknown_action']);
}
j(405,['ok'=>false,'error'=>'method_not_allowed']);
