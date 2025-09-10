<?php
/**
 * CRUD de posts del blog (simplificado):
 * - Listar
 * - Crear rápido (Título + Categoría + Tags + Contenido)
 * - Editar (link a página de edición separada)
 * - Eliminar
 */
require_once __DIR__ . '/admin_boot.php';

// Crear post
if($_SERVER['REQUEST_METHOD']==='POST' && ($_POST['op'] ?? '')==='create') {
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'General');
    $tags = trim($_POST['tags'] ?? '');
    $content = $_POST['content'] ?? '';
    if($title==='') { $error='Título requerido'; }
    else {
        $slug = blog_generate_unique_slug($title);
        $excerpt = make_excerpt($content);
        // Insert conservador (si no existe tabla: mostrar error amigable)
        $ok = @mysqli_query($conexion, "SELECT 1 FROM posts LIMIT 1");
        if(!$ok){ $error='La tabla posts no existe. Crea migración primero.'; }
        else {
            $stmt = $conexion->prepare('INSERT INTO posts (title,slug,excerpt,content,category,tags,status,published_at,author) VALUES (?,?,?,?,?,?,"published",NOW(),?)');
            $author = $_SESSION['usuario'] ?? 'admin';
            $stmt->bind_param('sssssss',$title,$slug,$excerpt,$content,$category,$tags,$author);
            if(!$stmt->execute()) $error='Error BD al crear'; else $created=true;
        }
    }
}

// Eliminar post
if($_SERVER['REQUEST_METHOD']==='POST' && ($_POST['op'] ?? '')==='delete') {
    $pid = (int)($_POST['id'] ?? 0);
    if($pid>0){
        $del = $conexion->prepare('DELETE FROM posts WHERE id=? LIMIT 1');
        $del->bind_param('i',$pid); $del->execute();
        $deleted = true;
    }
}

// Listado
$page = max(1,(int)($_GET['page'] ?? 1));
$perPage = 15; $offset = ($page-1)*$perPage;
$rows = [];$total=0;$pages=1;
$ok = @mysqli_query($conexion,'SELECT COUNT(*) c FROM posts');
if($ok){
    $total = (int)mysqli_fetch_assoc($ok)['c'];
    $pages = max(1,ceil($total/$perPage));
    $sql = "SELECT id,title,slug,category,tags,published_at FROM posts ORDER BY published_at DESC LIMIT $perPage OFFSET $offset";
    $res = mysqli_query($conexion,$sql);
    while($r = $res->fetch_assoc()) $rows[]=$r;
}
?>
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Admin - Blog</title>
<link rel="stylesheet" href="../admin.css"><link rel="stylesheet" href="../style.css">
<style>
  form.create-box{background:var(--admin-card);padding:1rem 1rem;border:1px solid var(--admin-border);border-radius:14px;margin-bottom:1.2rem;display:grid;gap:.7rem;}
  form.create-box input,form.create-box textarea{width:100%;padding:.55rem .65rem;border:1px solid var(--admin-border);border-radius:8px;font-size:.8rem;}
  form.create-box textarea{min-height:140px;resize:vertical;}
  table.blog{width:100%;border-collapse:collapse;background:var(--admin-card);}
  table.blog th,table.blog td{padding:.55rem .6rem;border-bottom:1px solid var(--admin-border);font-size:.7rem;}
  table.blog th{background:rgba(0,0,0,.05);text-align:left;font-weight:600;}
  .tag-chip{background:#ececec;padding:.15rem .45rem;border-radius:999px;font-size:.55rem;margin:.1rem .25rem;display:inline-block;}
  [data-theme="dark"] .tag-chip{background:#333;color:#ddd;}
  .msg{padding:.6rem .75rem;border-radius:8px;font-size:.7rem;margin-bottom:.8rem;}
  .ok{background:#dff5e4;color:#1d6b2f;border:1px solid #b4e4c1;}
  .err{background:#ffe7e6;color:#842029;border:1px solid #f5c2c0;}
</style>
</head><body>
<header class="admin-topbar"><h1>Blog</h1><nav><a href="index.php">Panel</a></nav></header>
<main style="padding:1rem 1.25rem;max-width:1100px;margin:auto;">
  <?php if(!empty($created)): ?><div class="msg ok">Post creado correctamente.</div><?php endif; ?>
  <?php if(!empty($deleted)): ?><div class="msg ok">Post eliminado.</div><?php endif; ?>
  <?php if(!empty($error)): ?><div class="msg err"><?=h($error)?></div><?php endif; ?>
  <details open>
    <summary style="cursor:pointer;font-weight:600;margin-bottom:.5rem;">Crear nuevo post</summary>
    <form method="post" class="create-box">
      <?=csrf_field()?>
      <input type="hidden" name="op" value="create" />
      <input name="title" placeholder="Título" required maxlength="160" />
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;">
        <input name="category" style="flex:1;min-width:160px;" placeholder="Categoría" value="General" />
        <input name="tags" style="flex:2;min-width:220px;" placeholder="tags separadas por coma" />
      </div>
      <textarea name="content" placeholder="Contenido (HTML o texto)"></textarea>
      <div style="display:flex;gap:.6rem;justify-content:flex-end;">
        <button type="submit">Publicar</button>
      </div>
    </form>
  </details>

  <h2 style="margin:1rem 0 .6rem;">Listado (<?=$total?>)</h2>
  <div style="overflow-x:auto;">
    <table class="blog">
      <thead><tr><th>ID</th><th>Título</th><th>Categoría</th><th>Tags</th><th>Fecha</th><th>Acciones</th></tr></thead>
      <tbody>
        <?php foreach($rows as $p): ?>
          <tr>
            <td><?=$p['id']?></td>
            <td><a href="../blog/post.php?slug=<?=h($p['slug'])?>" target="_blank" rel="noopener"><?=h($p['title'])?></a></td>
            <td><?=h($p['category'])?></td>
            <td><?php foreach(array_filter(preg_split('/\s*,\s*/',$p['tags'])) as $tg): ?><span class="tag-chip">#<?=h($tg)?></span><?php endforeach; ?></td>
            <td><?=h($p['published_at'])?></td>
            <td style="white-space:nowrap;">
              <a href="blog_post_edit.php?id=<?=$p['id']?>" style="font-size:.65rem;">Editar</a>
              <form method="post" style="display:inline" onsubmit="return confirm('¿Eliminar?');">
                <?=csrf_field()?>
                <input type="hidden" name="op" value="delete" />
                <input type="hidden" name="id" value="<?=$p['id']?>" />
                <button style="background:#d9534f;font-size:.6rem;">Eliminar</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        <?php if(!$rows): ?><tr><td colspan="6" style="text-align:center;opacity:.6;">Sin posts</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
  <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.8rem;">
    <?php for($i=1;$i<=$pages;$i++): ?>
      <a href="?page=<?=$i?>" style="padding:.35rem .6rem;border:1px solid var(--admin-border);border-radius:6px;font-size:.65rem;text-decoration:none;<?=($i===$page?'background:var(--admin-accent);color:#fff;':'')?>"><?=$i?></a>
    <?php endfor; ?>
  </div>
</main>
</body></html>
