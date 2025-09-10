<?php
require_once __DIR__ . '/../includes/blog_functions.php';
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$post = $slug ? blog_get_post($slug) : null;
if(!$post){
  http_response_code(404);
  echo "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'><title>No encontrado</title></head><body><h1>Artículo no encontrado</h1><p><a href='index.php'>Volver al blog</a></p></body></html>"; exit;
}
$related = $post['category'] ? blog_related($post['category'],$post['slug']) : [];
?><!DOCTYPE html>
<html lang="es" data-theme="">
<head>
<meta charset="UTF-8">
<title><?=htmlspecialchars($post['title'])?> | Blog Alaska</title>
<meta name="description" content="<?=htmlspecialchars($post['excerpt'] ?: mb_substr(strip_tags($post['content']),0,155))?>">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="blog.css">
<script src="../js/theme-toggle.js" defer></script>
<script type="application/ld+json">
<?=json_encode([
  '@context'=>'https://schema.org',
  '@type'=>'BlogPosting',
  'headline'=>$post['title'],
  'datePublished'=>$post['published_at'],
  'dateModified'=>$post['updated_at'] ?? $post['published_at'],
  'author'=>['@type'=>'Person','name'=>$post['author']],
  'articleSection'=>$post['category'] ?: 'General'
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?>
</script>
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
        <li><a href="index.php">Blog</a></li>
        <li><a href="../login.php" class="inicial-circulo" title="Iniciar sesión">U</a></li>
      </ul>
    </nav>
  </div>
</header>
<main class="post-wrapper">
  <article class="post-full">
    <header class="post-header">
      <p class="breadcrumb"><a href="index.php">Blog</a> / <?=htmlspecialchars($post['category'] ?: 'General')?></p>
      <h1><?=htmlspecialchars($post['title'])?></h1>
      <div class="meta-line">
        <span><?=htmlspecialchars($post['author'])?></span> ·
        <time datetime="<?=$post['published_at']?>"> <?=date('d M Y', strtotime($post['published_at']))?> </time>
      </div>
      <?php if(!empty($post['cover_image'])): ?>
        <figure class="cover"><img src="../uploads/<?=htmlspecialchars($post['cover_image'])?>" alt="<?=htmlspecialchars($post['title'])?>"></figure>
      <?php endif; ?>
    </header>
    <div class="post-body">
      <?= $post['content']; ?>
    </div>
    <?php if(!empty($post['tags'])): ?>
      <div class="tags-line">
        <?php foreach(explode(',', $post['tags']) as $t): $t=trim($t); if(!$t) continue; ?>
          <a class="tag" href="index.php?tag=<?=urlencode($t)?>"><?=htmlspecialchars($t)?></a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
    <nav class="post-nav"><a href="index.php" class="back">← Volver al Blog</a></nav>
  </article>
  <?php if($related): ?>
  <aside class="related">
    <h3>Relacionados</h3>
    <div class="related-grid">
      <?php foreach($related as $r): ?>
        <a class="rel-card" href="post.php?slug=<?=urlencode($r['slug'])?>">
          <span class="rel-title"><?=htmlspecialchars($r['title'])?></span>
          <time datetime="<?=htmlspecialchars($r['published_at'])?>"> <?=date('d M Y', strtotime($r['published_at']))?> </time>
        </a>
      <?php endforeach; ?>
    </div>
  </aside>
  <?php endif; ?>
</main>
<script src="../views/MenuView.js"></script>
<script src="../views/ButtonView.js"></script>
<script src="../views/FormView.js"></script>
<script src="blog.js" defer></script>
<script src="../utils/ai-chatbot.js" defer></script>
</body>
</html>
