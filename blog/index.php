<?php
require_once __DIR__ . '/../includes/blog_functions.php';
$q   = isset($_GET['q']) ? trim($_GET['q']) : null;
$cat = isset($_GET['cat']) ? trim($_GET['cat']) : null;
$tag = isset($_GET['tag']) ? trim($_GET['tag']) : null;
$page= max(1, (int)($_GET['page'] ?? 1));
$data = blog_get_posts($page, 6, $q ?: null, $cat ?: null, $tag ?: null);
$allCats = blog_get_categories();
$allTags = blog_get_tags();
?><!DOCTYPE html>
<html lang="es" data-theme="">
<head>
<meta charset="UTF-8">
<title>Blog | Alaska</title>
<meta name="description" content="Consejos y recursos sobre el cuidado y bienestar de mascotas.">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="blog.css">
<script src="../js/theme-toggle.js" defer></script>
</head>
<body>
<header class="cabecera-principal">
  <div class="contenedor contenedor-cabecera">
    <div class="logo">
      <div class="contenedor-logo">
        <div class="contenedor-imagen-logo">
          <img src="../img/logo.jpg" alt="Logo Alaska" class="img-logo" />
        </div>
        <h1>ALASKA</h1>
      </div>
    </div>
    <nav class="navegacion-principal">
      <button class="boton-menu-movil" aria-label="Abrir menú">
        <i class="fas fa-bars"></i>
      </button>
      <ul class="lista-navegacion">
        <li><a href="../index.html">Inicio</a></li>
        <li><a href="../index.html#nosotros">Nosotros</a></li>
        <li><a href="../contacto.html">Contacto</a></li>
        <li><a href="../citas.html">Citas</a></li>
        <li><a href="../agenda.html">Agenda</a></li>
        <li><a href="index.php" class="activo">Blog</a></li>
        <li><a href="../login.php" class="inicial-circulo" title="Iniciar sesión">U</a></li>
      </ul>
    </nav>
  </div>
</header>
<main class="blog-wrapper">
  <section class="blog-hero">
    <h1>Blog de Bienestar Animal</h1>
    <p>Guías, ideas y recursos para el cuidado responsable.</p>
    <form class="blog-search" method="get">
      <input type="text" name="q" value="<?=htmlspecialchars($q ?? '')?>" placeholder="Buscar artículos...">
      <button type="submit" aria-label="Buscar">Buscar</button>
      <?php if($q): ?><a class="clear" href="index.php">Limpiar</a><?php endif; ?>
    </form>
  </section>
  <div class="blog-filters">
    <?php
      $baseParams = $_GET; unset($baseParams['cat'],$baseParams['tag'],$baseParams['page']);
      $clearUrl = 'index.php';
      if(!empty($baseParams)) $clearUrl .= '?'.http_build_query($baseParams);
    ?>
    <a href="<?=$clearUrl?>" class="<?=($cat||$tag)?'':'active'?>">Todos</a>
    <?php foreach($allCats as $c): $params=$baseParams; $params['cat']=$c; $url='?'.http_build_query($params); $cl=($cat===$c)?'active':''; ?>
      <a class="<?=$cl?>" href="<?=$url?>"><?=htmlspecialchars($c)?></a>
    <?php endforeach; ?>
  </div>
  <?php if($allTags): ?>
  <div class="blog-tags-filter" style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-bottom:1rem;">
    <?php foreach($allTags as $t): $params = $baseParams; if($cat) $params['cat']=$cat; $params['tag']=$t; $url='?'.http_build_query($params); $active = ($tag===$t)?'style="background:var(--color-secundario);color:#fff;border-color:var(--color-secundario);"':''; ?>
      <a href="<?=$url?>" class="tag-chip" <?=$active?>>#<?=htmlspecialchars($t)?></a>
    <?php endforeach; ?>
    <?php if($tag): $params=$baseParams; if($cat) $params['cat']=$cat; $url='?'.http_build_query($params); ?>
      <a href="<?=$url?>" class="tag-chip" style="background:#b23; color:#fff;">Quitar tag ✕</a>
    <?php endif; ?>
  </div>
  <?php endif; ?>
  <section class="posts-grid" aria-live="polite">
    <?php foreach($data['posts'] as $p): ?>
      <article class="post-card">
        <a class="img-wrap" href="post.php?slug=<?=urlencode($p['slug'])?>">
          <?php if(!empty($p['cover_image'])): ?>
            <img src="../uploads/<?=htmlspecialchars($p['cover_image'])?>" alt="<?=htmlspecialchars($p['title'])?>">
          <?php else: ?>
            <div class="placeholder-img">Sin imagen</div>
          <?php endif; ?>
        </a>
        <div class="post-meta">
          <span class="category"><?=htmlspecialchars($p['category'] ?: 'General')?></span>
          <time datetime="<?=htmlspecialchars($p['published_at'])?>"> <?=date('d M Y', strtotime($p['published_at']))?> </time>
        </div>
        <h2><a href="post.php?slug=<?=urlencode($p['slug'])?>"><?=htmlspecialchars($p['title'])?></a></h2>
        <p class="excerpt"><?=htmlspecialchars($p['excerpt'])?></p>
        <a class="read-more" href="post.php?slug=<?=urlencode($p['slug'])?>">Leer más →</a>
      </article>
    <?php endforeach; ?>
    <?php if(!$data['posts']): ?><p class="no-results">No se encontraron artículos.</p><?php endif; ?>
  </section>
  <?php if($data['pages']>1): ?>
  <nav class="pagination" aria-label="Paginación de artículos">
    <?php for($i=1;$i<=$data['pages'];$i++): $params = $_GET; $params['page']=$i; $url='?'.http_build_query($params); $cls = $i===$page?'current':''; ?>
      <a class="<?=$cls?>" href="<?=$url?>"> <?=$i?> </a>
    <?php endfor; ?>
  </nav>
  <?php endif; ?>
</main>
<script src="../views/MenuView.js"></script>
<script src="../views/ButtonView.js"></script>
<script src="../views/FormView.js"></script>
<script src="blog.js" defer></script>
<script src="../utils/ai-chatbot.js" defer></script>
</body>
</html>
