<?php
require_once __DIR__.'/bootstrap.php';
rate_limit('comment_create',25,60);
$in = json_input();
$postId = (int)($in['post_id'] ?? ($_POST['post_id'] ?? 0));
$text = isset($in['text'])? limit_len(sanitize_text($in['text']), 400):'';
if($postId<=0 || mb_strlen($text)<2) fail('datos');
$chk = $conexion->prepare('SELECT id FROM social_posts WHERE id=? AND is_hidden=0 LIMIT 1');
$chk->bind_param('i',$postId);$chk->execute();$exists = $chk->get_result()->num_rows; if(!$exists) fail('post');
$stmt = $conexion->prepare('INSERT INTO social_comments (post_id,user_id,comment) VALUES (?,?,?)');
$stmt->bind_param('iis',$postId,$userId,$text);
if(!$stmt->execute()) fail('db');
$conexion->query('UPDATE social_posts SET comments_count = comments_count+1 WHERE id='.(int)$postId);
success(['id'=>$stmt->insert_id]);
