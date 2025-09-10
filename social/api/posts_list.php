<?php
require_once __DIR__.'/bootstrap.php';
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(20, max(1,(int)($_GET['perPage'] ?? 10)));
$q = trim($_GET['q'] ?? '');
$tag = trim($_GET['tag'] ?? '');
// soporte multi-tag: tag[]=a&tag[]=b (condición OR)
$tags = [];
if(isset($_GET['tag']) && is_array($_GET['tag'])){
  foreach($_GET['tag'] as $tg){ $tg=trim($tg); if($tg!=='') $tags[]=$tg; }
}
$offset = ($page-1)*$perPage;
$where = ' WHERE is_hidden=0 ';
$params = [];
$types = '';
if($q !== ''){
  $where .= ' AND (content LIKE ? OR tags LIKE ?)';
  $like = '%'.$q.'%';
  $params[]=$like; $params[]=$like; $types.='ss';
}
if($tag !== '' && empty($tags)){
  $where .= ' AND (FIND_IN_SET(?, REPLACE(tags, " ", ""))>0 OR tags LIKE ?)';
  $params[]=$tag; $params[]='%'.$tag.'%';
  $types.='ss';
}
if($tags){
  $sub=[]; foreach($tags as $tg){ $sub[]='(FIND_IN_SET(?, REPLACE(tags, " ", ""))>0 OR tags LIKE ?)'; $params[]=$tg; $params[]='%'.$tg.'%'; $types.='ss'; }
  $where .= ' AND ('.implode(' OR ',$sub).')';
}
$sql = "SELECT SQL_CALC_FOUND_ROWS id,user_id,content,image,tags,likes_count,comments_count,created_at FROM social_posts $where ORDER BY id DESC LIMIT ? OFFSET ?";
$params[]=$perPage; $params[]=$offset; $types.='ii';
$stmt = $conexion->prepare($sql);
if($params){ $stmt->bind_param($types,...$params); }
$stmt->execute();
$res = $stmt->get_result();
$posts = [];
while($row = $res->fetch_assoc()){
  $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
  $posts[]=$row;
}
$totalRes = $conexion->query('SELECT FOUND_ROWS() AS t');
$total = (int)$totalRes->fetch_assoc()['t'];
$pages = max(1, ceil($total/$perPage));
success(['posts'=>$posts,'page'=>$page,'pages'=>$pages,'total'=>$total,'multiTag'=>(bool)$tags]);
