<?php
require_once __DIR__.'/bootstrap.php';
rate_limit('post_create',10,60); // máx 10 por minuto
$in = !empty($_POST) ? $_POST : (!empty($_FILES) ? $_POST : json_input());
$content = isset($in['content'])? limit_len(sanitize_text($in['content']), 1000):'';
$tagsRaw = $in['tags'] ?? '';
if(mb_strlen($content) < 5) fail('contenido_corto');
$tags = array_slice(array_filter(array_unique(array_map(function($t){
  $t = preg_replace('/[^\pL0-9_-]+/u','-', mb_strtolower(trim($t)));
  return trim($t,'-');
}, preg_split('/[,#\s]+/u',$tagsRaw))), function($t){return $t!=='';}),0,8);
$tagsStr = implode(',', $tags);
$imageName = null;
if(!empty($_FILES['image']['name'])){
  $f = $_FILES['image'];
  if($f['error']===UPLOAD_ERR_OK){
    $mime = mime_content_type($f['tmp_name']);
    if(!preg_match('/^image\/(jpeg|png|gif|webp)$/',$mime)) fail('imagen_no_valida');
    if($f['size'] > 2*1024*1024) fail('imagen_pesada');
    $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
    $hash = bin2hex(random_bytes(8));
    $imageName = $hash.'.'.$ext;
    $dest = __DIR__ . '/../../uploads/'.$imageName;
    if(!is_dir(dirname($dest))) mkdir(dirname($dest),0775,true);
    move_uploaded_file($f['tmp_name'],$dest);
  }
}
$stmt = $conexion->prepare('INSERT INTO social_posts (user_id,content,image,tags) VALUES (?,?,?,?)');
$stmt->bind_param('isss',$userId,$content,$imageName,$tagsStr);
if(!$stmt->execute()) fail('db');
$id = $stmt->insert_id;
success(['id'=>$id]);
