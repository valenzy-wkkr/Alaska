<?php
/**
 * Blog helper con soporte FULLTEXT (si existe), fallback JSON y meta avanzada.
 */
require_once __DIR__ . '/../php/conexion.php';

const BLOG_MAX_PER_PAGE = 50;
const BLOG_DEFAULT_PER_PAGE = 6;
const BLOG_FALLBACK_FILE = __DIR__ . '/../data/blog-articles.json';
const BLOG_META_CACHE_TTL = 60; // segundos
const BLOG_CACHE_DIR = __DIR__ . '/../cache';

// Polyfills silenciosos para APCu si la extensión no está cargada (evita errores de análisis)
if(!function_exists('apcu_fetch')){
    function apcu_fetch($key,&$success=null){ $success = false; return null; }
}
if(!function_exists('apcu_store')){
    function apcu_store($key,$value,$ttl=0){ return false; }
}

function blog_db(){ global $conexion; return $conexion; }

function blog_sanitize_slug(string $s): string {
    $s = mb_strtolower(trim($s));
    if(function_exists('iconv')){ $tmp = @iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$s); if($tmp!==false) $s=$tmp; }
    $s = preg_replace('/[^a-z0-9]+/','-',$s);
    $s = trim($s,'-');
    return $s ?: 'post-'.substr(sha1(uniqid('',true)),0,8);
}

// Sanitizador básico de HTML permitiendo un subconjunto seguro.
function blog_sanitize_html(string $html): string {
    // Si se instalara HTMLPurifier se podría integrar aquí.
    // Lista blanca mínima.
    $allowed = '<p><br><strong><b><em><i><ul><ol><li><h1><h2><h3><h4><a>'; 
    // Elimina scripts/eventos peligrosos rápidamente.
    $clean = preg_replace('/<\s*script[^>]*>.*?<\s*\/\s*script>/is','',$html);
    $clean = preg_replace('/on[a-zA-Z]+\s*=\s*"[^"]*"/i','',$clean); // elimina on*="..."
    $clean = preg_replace('/on[a-zA-Z]+\s*=\s*\'[^\']*\'/i','',$clean);
    $clean = strip_tags($clean, $allowed);
    // Normaliza enlaces: sólo http/https
    $clean = preg_replace_callback('/<a\s+[^>]*href=(["\'])(.*?)\1[^>]*>/i', function($m){
        $url = trim($m[2]);
        if(!preg_match('#^https?://#i',$url)) return '<span>'; // descarta link no seguro
        return '<a href="'.htmlspecialchars($url,ENT_QUOTES,'UTF-8').'" rel="noopener noreferrer" target="_blank">';
    }, $clean);
    return $clean;
}

// Cache genérica con APCu o archivos
function blog_cache_get(string $key){
    // APCu opcional; si no está, se ignora
    if(function_exists('apcu_fetch')){ $ok = false; $v = @apcu_fetch('blog_'.$key, $ok); return $ok? $v : null; }
    $file = BLOG_CACHE_DIR.'/blog_'.sha1($key).'.cache.php';
    if(!file_exists($file)) return null;
    $data = include $file; // retorna array ['exp'=>int,'val'=>mixed]
    if(!is_array($data) || !isset($data['exp'])) return null;
    if($data['exp'] < time()){ @unlink($file); return null; }
    return $data['val'];
}
function blog_cache_set(string $key, $value, int $ttl){
    if(function_exists('apcu_store')){ @apcu_store('blog_'.$key,$value,$ttl); return; }
    if(!is_dir(BLOG_CACHE_DIR)) @mkdir(BLOG_CACHE_DIR,0775,true);
    $file = BLOG_CACHE_DIR.'/blog_'.sha1($key).'.cache.php';
    $payload = '<?php return '.var_export(['exp'=>time()+$ttl,'val'=>$value], true).';';
    @file_put_contents($file,$payload,LOCK_EX);
}

function table_exists($db,$table): bool {
    $t = mysqli_real_escape_string($db,$table);
    $res = mysqli_query($db,"SHOW TABLES LIKE '$t'");
    return $res && mysqli_num_rows($res) > 0;
}
function column_exists($db,$table,$col): bool {
    $q = mysqli_query($db, "SHOW COLUMNS FROM `".mysqli_real_escape_string($db,$table)."` LIKE '".mysqli_real_escape_string($db,$col)."'");
    return $q && mysqli_num_rows($q) > 0;
}
function fulltext_exists($db,$table,$indexName='idx_posts_fulltext'): bool {
    $t = mysqli_real_escape_string($db,$table);
    $i = mysqli_real_escape_string($db,$indexName);
    $res = mysqli_query($db,"SHOW INDEX FROM `$t` WHERE Key_name='$i'");
    return $res && mysqli_num_rows($res) > 0;
}

// Intento de crear FULLTEXT si no existe (silencioso)
function blog_ensure_fulltext(){
    $db = blog_db();
    if(!table_exists($db,'posts')) return;
    // Campos objetivo
    if(!fulltext_exists($db,'posts')){
        @mysqli_query($db,"ALTER TABLE posts ADD FULLTEXT idx_posts_fulltext (title, content, tags)");
    }
}
blog_ensure_fulltext();

// Migración silenciosa: asegurar columna cover_image para compatibilidad con select que la utiliza.
// Instalaciones previas podían tener la tabla posts sin este campo (versión mínima creada desde admin/index.php).
// Evita el fatal "Unknown column 'cover_image' in 'field list'" al hacer SELECT.
if(table_exists(blog_db(),'posts') && !column_exists(blog_db(),'posts','cover_image')){
    @mysqli_query(blog_db(), "ALTER TABLE posts ADD cover_image VARCHAR(255) NULL AFTER tags");
}

/**
 * Lista paginada de posts con filtros.
 * Retorna: posts[], total, pages, page, perPage, hasNext, usedFulltext(bool)
 */
function blog_get_posts(int $page=1, int $perPage=BLOG_DEFAULT_PER_PAGE, ?string $q=null, ?string $cat=null, ?string $tag=null, ?array $tags=null): array {
    $db = blog_db();
    $page = max(1,$page);
    $perPage = min(BLOG_MAX_PER_PAGE, max(1,$perPage));
    if(!table_exists($db,'posts')){
        return blog_get_posts_fallback_json($page,$perPage,$q,$cat,$tag);
    }
    $useFulltext = false;
    $params = [];
    $whereFragments = [];
    if(column_exists($db,'posts','status')) $whereFragments[] = "status='published'";
    if($cat){ $whereFragments[] = "category = ?"; $params[]=$cat; }
    // Compatibilidad: $tag único o arreglo $tags (multi-tag ANY)
    if($tags && count($tags)>0){
        $tagConds = [];
        foreach($tags as $tg){
            $tgNorm = mb_strtolower(trim($tg));
            if($tgNorm==='') continue;
            $tagConds[] = "(FIND_IN_SET(?, REPLACE(LOWER(tags),' ','')) > 0 OR LOWER(tags) LIKE ?)";
            $params[] = $tgNorm;
            $params[] = '%'.$tgNorm.'%';
        }
        if($tagConds) $whereFragments[] = '('.implode(' OR ',$tagConds).')';
    } elseif($tag){
        $whereFragments[] = "(FIND_IN_SET(?, REPLACE(LOWER(tags),' ','')) > 0 OR LOWER(tags) LIKE ? )";
        $params[] = mb_strtolower($tag);
        $params[] = '%'.mb_strtolower($tag).'%';
    }
    $searchClause = '';
    if($q){
        $qNorm = trim($q);
        if(fulltext_exists($db,'posts')){
            $useFulltext = true;
            $searchClause = "MATCH(title, content, tags) AGAINST (? IN NATURAL LANGUAGE MODE)";
            $params[] = $qNorm;
        } else {
            $searchClause = "(title LIKE ? OR content LIKE ? OR tags LIKE ?)";
            $like = '%'.$qNorm.'%';
            $params[]=$like; $params[]=$like; $params[]=$like;
        }
        $whereFragments[] = $searchClause;
    }
    $where = $whereFragments? ('WHERE '.implode(' AND ',$whereFragments)) : '';
    $offset = ($page-1)*$perPage;

    // Query datos (sin SQL_CALC_FOUND_ROWS)
    $sql = "SELECT id,title,slug,excerpt,content,category,tags,cover_image,published_at,author".
            ($useFulltext? ", $searchClause AS relevance": "") .
            " FROM posts $where ORDER BY ".($useFulltext? 'relevance DESC, published_at DESC' : 'published_at DESC')." LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($db,$sql);
    $bindParams = $params; $bindTypes = $params? str_repeat('s', count($params)) : '';
    $bindParams[] = $perPage; $bindParams[] = $offset; $bindTypes .= 'ii';
    mysqli_stmt_bind_param($stmt,$bindTypes,...$bindParams);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $rows=[]; while($r=mysqli_fetch_assoc($res)){ if(!$r['excerpt']){ $r['excerpt']=mb_substr(strip_tags($r['content']),0,180).'…'; } $rows[]=$r; }

    // Conteo total
    $countSql = "SELECT COUNT(*) c FROM posts $where";
    $stmt2 = mysqli_prepare($db,$countSql);
    if($params){ $types = str_repeat('s', count($params)); mysqli_stmt_bind_param($stmt2,$types,...$params); }
    mysqli_stmt_execute($stmt2);
    $countRes = mysqli_stmt_get_result($stmt2); $total = (int)mysqli_fetch_assoc($countRes)['c'];
    $pages = max(1,(int)ceil($total/$perPage));
    return [
        'posts'=>$rows,
        'total'=>$total,
        'pages'=>$pages,
        'page'=>$page,
        'perPage'=>$perPage,
        'hasNext'=>$page<$pages,
        'usedFulltext'=>$useFulltext
    ];
}

function blog_get_post(string $slug): ?array {
    $db = blog_db();
    if(!table_exists($db,'posts')){ // fallback JSON search
        $fallback = blog_get_posts_fallback_json(1,1000,null,null,null);
        foreach($fallback['posts'] as $p){ if($p['slug']===$slug) return $p; }
        return null;
    }
    $sql = "SELECT * FROM posts WHERE slug=? LIMIT 1";
    $stmt = mysqli_prepare($db,$sql);
    mysqli_stmt_bind_param($stmt,'s',$slug);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($res);
    return $row ?: null;
}

function blog_related(string $category,string $excludeSlug,int $limit=3): array {
    $db = blog_db();
    if(!table_exists($db,'posts')) return [];
    $sql = "SELECT title,slug,cover_image,published_at FROM posts WHERE category=? AND slug<>? ORDER BY published_at DESC LIMIT ?";
    $stmt = mysqli_prepare($db,$sql);
    mysqli_stmt_bind_param($stmt,'ssi',$category,$excludeSlug,$limit);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $out=[]; while($r=mysqli_fetch_assoc($res)) $out[]=$r; return $out;
}

function blog_get_posts_fallback_json(int $page,int $perPage,?string $q,?string $cat,?string $tag): array {
    if(!file_exists(BLOG_FALLBACK_FILE)) return ['posts'=>[], 'total'=>0,'pages'=>1,'page'=>$page,'perPage'=>$perPage,'hasNext'=>false,'usedFulltext'=>false];
    $raw = json_decode(@file_get_contents(BLOG_FALLBACK_FILE), true) ?: [];
    $items = array_map(function($r){
        return [
            'id'=>$r['id'] ?? null,
            'title'=>$r['title'] ?? '',
            'slug'=>blog_sanitize_slug($r['title'] ?? uniqid('post-')),
            'excerpt'=>$r['excerpt'] ?? '',
            'content'=>nl2br($r['content'] ?? ''),
            'category'=>$r['category'] ?? 'General',
            'tags'=> isset($r['tags']) && is_array($r['tags'])? implode(',', $r['tags']) : ($r['tags'] ?? ''),
            'cover_image'=>$r['image'] ?? null,
            'published_at'=>$r['date'] ?? date('Y-m-d'),
            'author'=>$r['author'] ?? 'Equipo Alaska'
        ];
    }, $raw);
    $filtered = array_filter($items, function($p) use($q,$cat,$tag){
        if($q){ $needle=mb_strtolower($q); $blob=mb_strtolower($p['title'].' '.$p['content'].' '.$p['tags']); if(strpos($blob,$needle)===false) return false; }
        if($cat && mb_strtolower($p['category'])!==mb_strtolower($cat)) return false;
        if($tag){ $tags=array_map('trim', explode(',', mb_strtolower($p['tags']))); if(!in_array(mb_strtolower($tag), $tags)) return false; }
        return true;
    });
    usort($filtered, fn($a,$b)=> strcmp($b['published_at'],$a['published_at']));
    $total = count($filtered);
    $pages = max(1,(int)ceil($total/$perPage));
    $slice = array_slice($filtered, ($page-1)*$perPage, $perPage);
    return [
        'posts'=>$slice,
        'total'=>$total,
        'pages'=>$pages,
        'page'=>$page,
        'perPage'=>$perPage,
        'hasNext'=>$page<$pages,
        'usedFulltext'=>false
    ];
}

function blog_get_categories(): array {
    $cache = blog_cache_get('cats');
    if($cache !== null) return $cache;
    $db = blog_db(); $cats=[];
    if(table_exists($db,'posts')){
        $res = mysqli_query($db,"SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category<>'' ORDER BY category ASC");
        while($r=mysqli_fetch_assoc($res)) $cats[]=$r['category'];
    } elseif(file_exists(BLOG_FALLBACK_FILE)) {
        $raw = json_decode(@file_get_contents(BLOG_FALLBACK_FILE), true) ?: [];
        foreach($raw as $r){ if(!empty($r['category'])) $cats[]=$r['category']; }
    }
    $cats = array_values(array_unique($cats));
    blog_cache_set('cats',$cats,BLOG_META_CACHE_TTL);
    return $cats;
}

function blog_get_tags(): array {
    $cache = blog_cache_get('tags');
    if($cache !== null) return $cache;
    $db = blog_db(); $tags=[];
    if(table_exists($db,'posts')){
        $res = mysqli_query($db,"SELECT tags FROM posts WHERE tags IS NOT NULL AND tags<>''");
        while($r=mysqli_fetch_assoc($res)){
            $parts = preg_split('/\s*,\s*/',$r['tags']); foreach($parts as $p){ if($p!=='') $tags[]=$p; }
        }
    } elseif(file_exists(BLOG_FALLBACK_FILE)) {
        $raw = json_decode(@file_get_contents(BLOG_FALLBACK_FILE), true) ?: [];
        foreach($raw as $r){ if(isset($r['tags'])){ $parts = is_array($r['tags'])? $r['tags']: preg_split('/\s*,\s*/',(string)$r['tags']); foreach($parts as $p){ if($p!=='') $tags[]=$p; } } }
    }
    $tags = array_values(array_unique($tags));
    sort($tags,SORT_NATURAL|SORT_FLAG_CASE);
    blog_cache_set('tags',$tags,BLOG_META_CACHE_TTL);
    return $tags;
}
