<?php
/**
 * Bootstrap común para todas las pantallas del panel de administración.
 * - Inicia sesión
 * - Carga conexión a base de datos
 * - Verifica rol administrador
 * - Provee helpers de seguridad (CSRF, escape)
 */
session_start();
require_once __DIR__ . '/../php/conexion.php';

// Verificación de rol administrador (se asume columna 'role' en tabla usuarios)
if(!isset($_SESSION['usuario_id']) || ($_SESSION['role'] ?? 'user') !== 'admin') {
    header('Location: ../login.php?need=admin');
    exit;
}

// Helper: escapar HTML de forma segura
function h(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }

// CSRF: token simple en sesión (suficiente para panel interno básico)
function csrf_token(): string {
    if(empty($_SESSION['_csrf_admin'])) {
        $_SESSION['_csrf_admin'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf_admin'];
}
function csrf_field(): string {
    return '<input type="hidden" name="_csrf" value="'.h(csrf_token()).'" />';
}
function csrf_assert(): void {
    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        $t = $_POST['_csrf'] ?? '';
        if(!hash_equals($_SESSION['_csrf_admin'] ?? '', $t)) {
            http_response_code(419);
            die('CSRF token inválido');
        }
    }
}

// Llamar automáticamente si se trata de una petición POST
csrf_assert();

// Utilidad para sanitizar HTML base (para excerpt/preview). Contenido extenso debería limpiarse en capa de creación.
function make_excerpt(string $html, int $len = 180): string {
    $plain = trim(strip_tags($html));
    if(mb_strlen($plain) > $len) return mb_substr($plain,0,$len).'…';
    return $plain;
}

// Función para generar slug único (evita colisiones en posts del blog)
function blog_generate_unique_slug(string $title): string {
    $base = preg_replace('/[^a-z0-9]+/','-', strtolower(trim(iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$title))));
    $base = trim($base,'-');
    if($base==='') $base = 'post';
    $slug = $base;
    global $conexion;
    $i=2;
    while(true){
        $stmt = $conexion->prepare('SELECT 1 FROM posts WHERE slug=? LIMIT 1');
        $stmt->bind_param('s',$slug); $stmt->execute(); $r = $stmt->get_result();
        if($r->num_rows===0) break; // libre
        $slug = $base.'-'.$i;
        if($i>50){ // fallback extremo
            $slug = $base.'-'.substr(sha1(uniqid('',true)),0,6);
            break;
        }
        $i++;
    }
    return $slug;
}

// Fecha legible rápida
function fmt_date(?string $ts): string { return $ts? date('Y-m-d H:i', strtotime($ts)) : '-'; }
