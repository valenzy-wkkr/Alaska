<?php
// Endpoint JSON para un post individual
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/blog_functions.php';

$slug = isset($_GET['slug'])? trim($_GET['slug']) : '';
if($slug===''){ http_response_code(400); echo json_encode(['ok'=>false,'error'=>'missing_slug']); exit; }

$p = blog_get_post($slug);
if(!$p){ http_response_code(404); echo json_encode(['ok'=>false,'error'=>'not_found']); exit; }

echo json_encode(['ok'=>true,'post'=>$p], JSON_UNESCAPED_UNICODE);
