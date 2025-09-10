<?php
/**
 * Edición de post del blog.
 */
require_once __DIR__ . '/admin_boot.php';
$id = (int)($_GET['id'] ?? 0);
if($id<=0){ die('ID inválido'); }

// Cargar post
$stmt = $conexion->prepare('SELECT id,title,slug,excerpt,content,category,tags,status FROM posts WHERE id=? LIMIT 1');
$stmt->bind_param('i',$id); $stmt->execute(); $res=$stmt->get_result();
$post = $res->fetch_assoc();
if(!$post){ die('No encontrado'); }

// Guardar cambios
if($_SERVER['REQUEST_METHOD']==='POST') {
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $tags = trim($_POST['tags'] ?? '');
    $status = in_array($_POST['status'] ?? 'published', ['draft','published']) ? $_POST['status'] : 'published';
    $content = $_POST['content'] ?? '';
    if($title==='') { $error='Título requerido'; }
    else {
        $excerpt = make_excerpt($content);
        $stmtU = $conexion->prepare('UPDATE posts SET title=?, category=?, tags=?, status=?, content=?, excerpt=? WHERE id=? LIMIT 1');
        $stmtU->bind_param('ssssssi',$title,$category,$tags,$status,$content,$excerpt,$id);
        if($stmtU->execute()) { $saved=true; // refrescar datos
            $post['title']=$title; $post['category']=$category; $post['tags']=$tags; $post['status']=$status; $post['content']=$content; $post['excerpt']=$excerpt; }
        else $error='Error guardando';
    }
}
?>
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Editar Post</title>
<link rel="stylesheet" href="../admin.css"><link rel="stylesheet" href="../style.css">
<style>
  form.edit{display:grid;gap:.75rem;max-width:900px;margin:1rem auto;background:var(--admin-card);padding:1rem 1rem;border:1px solid var(--admin-border);border-radius:14px;}
  form.edit input,form.edit textarea,form.edit select{padding:.55rem .6rem;border:1px solid var(--admin-border);border-radius:8px;font-size:.8rem;}
  form.edit textarea{min-height:220px;resize:vertical;}
  .msg{padding:.6rem .75rem;border-radius:8px;font-size:.7rem;margin-bottom:.3rem;}
  .ok{background:#dff5e4;color:#1d6b2f;border:1px solid #b4e4c1;}
  .err{background:#ffe7e6;color:#842029;border:1px solid #f5c2c0;}
</style>
</head><body>
<header class="admin-topbar"><h1>Editar Post #<?=$post['id']?></h1><nav><a href="blog_posts.php">Volver</a></nav></header>
<main>
  <div style="max-width:960px;margin:auto;padding:1rem 1.25rem;">
    <?php if(!empty($saved)): ?><div class="msg ok">Guardado</div><?php endif; ?>
    <?php if(!empty($error)): ?><div class="msg err"><?=h($error)?></div><?php endif; ?>
    <form method="post" class="edit">
      <?=csrf_field()?>
      <label>Título
        <input name="title" value="<?=h($post['title'])?>" required maxlength="160" />
      </label>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;">
        <label style="flex:1;min-width:160px;">Categoría
          <input name="category" value="<?=h($post['category'])?>" />
        </label>
        <label style="flex:2;min-width:240px;">Tags
          <input name="tags" value="<?=h($post['tags'])?>" />
        </label>
        <label style="flex:1;min-width:140px;">Estado
          <select name="status">
            <option value="published" <?=$post['status']==='published'?'selected':''?>>Publicado</option>
            <option value="draft" <?=$post['status']==='draft'?'selected':''?>>Borrador</option>
          </select>
        </label>
      </div>
      <label>Contenido
        <textarea name="content"><?=h($post['content'])?></textarea>
      </label>
      <div style="display:flex;gap:.6rem;justify-content:flex-end;">
        <button type="submit">Guardar</button>
      </div>
    </form>
  </div>
</main>
</body></html>
