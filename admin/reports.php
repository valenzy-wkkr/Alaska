<?php
/**
 * Moderación de reportes (social_reports):
 * - Lista primeros 100 reportes
 * - Permite ocultar / mostrar posts o comentarios directamente
 */
require_once __DIR__ . '/admin_boot.php';

// Manejo de acciones (ocultar/mostrar)
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['accion'], $_POST['target_type'], $_POST['target_id'])) {
    $targetType = $_POST['target_type'];
    $targetId = (int)$_POST['target_id'];
    if(in_array($targetType,['post','comment'],true) && $targetId>0){
        if($targetType==='post'){
            if($_POST['accion']==='hide'){
                $stmt=$conexion->prepare('UPDATE social_posts SET is_hidden=1 WHERE id=?');
                $stmt->bind_param('i',$targetId); $stmt->execute();
            } elseif($_POST['accion']==='show') {
                $stmt=$conexion->prepare('UPDATE social_posts SET is_hidden=0 WHERE id=?');
                $stmt->bind_param('i',$targetId); $stmt->execute();
            }
        } else { // comment
            // Si no existe columna is_hidden en comments, la añadimos silenciosamente
            @mysqli_query($conexion,'ALTER TABLE social_comments ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0');
            if($_POST['accion']==='hide'){
                $stmt=$conexion->prepare('UPDATE social_comments SET is_hidden=1 WHERE id=?');
                $stmt->bind_param('i',$targetId); $stmt->execute();
            } elseif($_POST['accion']==='show') {
                $stmt=$conexion->prepare('UPDATE social_comments SET is_hidden=0 WHERE id=?');
                $stmt->bind_param('i',$targetId); $stmt->execute();
            }
        }
    }
    header('Location: reports.php');
    exit;
}

// Obtener reportes (si tabla no existe, mostrar vacío)
$reports = [];
$ok = @mysqli_query($conexion,'SELECT id,target_type,target_id,user_id,reason,created_at FROM social_reports ORDER BY id DESC LIMIT 100');
if($ok){
    while($r = $ok->fetch_assoc()) $reports[]=$r;
}
?>
<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Admin - Reportes</title>
<link rel="stylesheet" href="../admin.css"><link rel="stylesheet" href="../style.css">
<style>
  table.rep{width:100%;border-collapse:collapse;background:var(--admin-card);}table.rep th,table.rep td{padding:.5rem .6rem;border-bottom:1px solid var(--admin-border);font-size:.65rem;}
  table.rep th{background:rgba(0,0,0,.05);text-align:left;font-weight:600;}
  .small{font-size:.6rem;opacity:.7;}
  form.inline{display:inline;}
</style>
</head><body>
<header class="admin-topbar"><h1>Reportes</h1><nav><a href="index.php">Panel</a></nav></header>
<main style="padding:1rem 1.25rem;">
  <h2 style="margin:.2rem 0 1rem;">Últimos (<?=count($reports)?>)</h2>
  <div style="overflow-x:auto;">
    <table class="rep">
      <thead><tr><th>ID</th><th>Tipo</th><th>Target</th><th>Usuario reportante</th><th>Razón</th><th>Fecha</th><th>Acción</th></tr></thead>
      <tbody>
      <?php foreach($reports as $rp): ?>
        <tr>
          <td><?=$rp['id']?></td>
          <td><?=h($rp['target_type'])?></td>
          <td>#<?=h($rp['target_id'])?></td>
          <td><?=h($rp['user_id'])?></td>
          <td><?=h($rp['reason'] ?? '-')?></td>
          <td><?=h($rp['created_at'])?></td>
          <td>
            <form method="post" class="inline" style="margin:0 .2rem;">
              <?=csrf_field()?>
              <input type="hidden" name="target_type" value="<?=h($rp['target_type'])?>" />
              <input type="hidden" name="target_id" value="<?=h($rp['target_id'])?>" />
              <input type="hidden" name="accion" value="hide" />
              <button style="background:#ff6d3c;">Ocultar</button>
            </form>
            <form method="post" class="inline" style="margin:0 .2rem;">
              <?=csrf_field()?>
              <input type="hidden" name="target_type" value="<?=h($rp['target_type'])?>" />
              <input type="hidden" name="target_id" value="<?=h($rp['target_id'])?>" />
              <input type="hidden" name="accion" value="show" />
              <button style="background:#2d7ef7;">Mostrar</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if(!$reports): ?><tr><td colspan="7" style="text-align:center;opacity:.6;">Sin reportes</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</main>
</body></html>
