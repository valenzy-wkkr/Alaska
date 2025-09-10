<?php
require_once __DIR__.'/bootstrap.php';
rate_limit('like_toggle',30,60); // 30 por minuto
$id = (int)($_POST['post_id'] ?? 0);
if($id<=0) fail('id');
// Check existing like
$chk = $conexion->prepare('SELECT id FROM social_likes WHERE post_id=? AND user_id=? LIMIT 1');
$chk->bind_param('ii',$id,$userId);$chk->execute();$r=$chk->get_result();
if($r->num_rows){
  // remove like
  $del = $conexion->prepare('DELETE FROM social_likes WHERE post_id=? AND user_id=? LIMIT 1');
  $del->bind_param('ii',$id,$userId);$del->execute();
  $conexion->query('UPDATE social_posts SET likes_count = GREATEST(likes_count-1,0) WHERE id='.(int)$id);
  success(['liked'=>false]);
} else {
  $ins = $conexion->prepare('INSERT INTO social_likes (post_id,user_id) VALUES (?,?)');
  $ins->bind_param('ii',$id,$userId); if(!$ins->execute()) fail('db');
  $conexion->query('UPDATE social_posts SET likes_count = likes_count+1 WHERE id='.(int)$id);
  success(['liked'=>true]);
}
