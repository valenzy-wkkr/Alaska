<?php
session_start();
if(!isset($_SESSION['usuario_id']) || ($_SESSION['role'] ?? 'user')!=='admin'){
  header('Location: ../login.php?need=admin'); exit;
}
require_once __DIR__ . '/../php/conexion.php';
// Auto-creación mínima de la tabla posts si aún no existe (evita fallo en instalaciones nuevas)
@mysqli_query($conexion, "CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content MEDIUMTEXT NULL,
  category VARCHAR(120) NULL,
  tags VARCHAR(250) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'published',
  published_at DATETIME NULL,
  author VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");
$stats = [
  'usuarios'=>(int)mysqli_fetch_row(mysqli_query($conexion,"SELECT COUNT(*) FROM usuarios"))[0],
  'blog_posts'=> (int)(mysqli_fetch_row(@mysqli_query($conexion,"SELECT COUNT(*) FROM posts"))[0] ?? 0),
  'social_posts'=>(int)(mysqli_fetch_row(@mysqli_query($conexion,"SELECT COUNT(*) FROM social_posts"))[0] ?? 0),
  'reportes'=>(int)(mysqli_fetch_row(@mysqli_query($conexion,"SELECT COUNT(*) FROM social_reports"))[0] ?? 0)
];
?><!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Admin - Alaska</title>
<link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="../admin.css"></head><body>
<header class="admin-topbar"><h1>Panel Admin</h1><nav><a href="../dashboard.php">Dashboard Usuario</a> | <a href="../logout.php">Salir</a></nav></header>
<main class="admin-grid">
<?php foreach($stats as $k=>$v): ?>
  <div class="admin-card"><h3><?=htmlspecialchars(strtoupper($k))?></h3><p class="metric"><?=$v?></p></div>
<?php endforeach; ?>
  <section class="admin-block">
    <h2>Gestión</h2>
    <ul style="list-style:none;padding-left:0;font-size:.85rem;line-height:1.6;">
      <li><a href="users.php">Usuarios</a></li>
      <li><a href="blog_posts.php">Blog Posts</a></li>
      <li><a href="social_moderation.php">Social Moderación</a></li>
      <li><a href="reports.php">Reportes</a></li>
    </ul>
  </section>
</main>
</body></html>