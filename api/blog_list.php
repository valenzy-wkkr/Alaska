<?php
// Endpoint JSON para listar posts con filtros y FULLTEXT si disponible
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/blog_functions.php';

$page = isset($_GET['page'])? (int)$_GET['page'] : 1;
$per  = isset($_GET['per'])? (int)$_GET['per'] : BLOG_DEFAULT_PER_PAGE;
$q    = isset($_GET['q'])? trim($_GET['q']) : null;
$cat  = isset($_GET['cat'])? trim($_GET['cat']) : null;
$tag  = isset($_GET['tag'])? trim($_GET['tag']) : null; // soporte legacy
// Multi-tag: tag[]=a&tag[]=b
$tags = [];
if(isset($_GET['tag']) && is_array($_GET['tag'])){
    foreach($_GET['tag'] as $t){ $t=trim($t); if($t!=='') $tags[]=$t; }
}
if(!$tags && isset($_GET['tags']) && is_array($_GET['tags'])){
    foreach($_GET['tags'] as $t){ $t=trim($t); if($t!=='') $tags[]=$t; }
}

try {
        $data = blog_get_posts($page,$per,$q,$cat,$tag,$tags?:null);
        $data['multiTag'] = (bool)$tags;
        echo json_encode(['ok'=>true,'data'=>$data], JSON_UNESCAPED_UNICODE);
} catch(Exception $e){
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'internal','message'=>$e->getMessage()]);
}
