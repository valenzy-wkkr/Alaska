<?php
// Endpoint JSON para categorías y tags
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/blog_functions.php';

try {
    $cats = blog_get_categories();
    $tags = blog_get_tags();
    echo json_encode(['ok'=>true,'categories'=>$cats,'tags'=>$tags], JSON_UNESCAPED_UNICODE);
} catch(Exception $e){
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'internal','message'=>$e->getMessage()]);
}
