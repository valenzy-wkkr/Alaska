<?php
/**
 * Gestión básica de usuarios:
 * - Listado con paginación simple
 * - Cambio de rol (user <-> admin)
 * - Desactivar (soft delete opcional: aquí sólo ejemplo cambiar role a 'user')
 */
require_once __DIR__ . '/admin_boot.php';

// Acción de cambio de rol
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['accion'], $_POST['uid'])) {
    $uid = (int)$_POST['uid'];
    if($_POST['accion']==='promote') {
        $stmt = $conexion->prepare('UPDATE usuarios SET role="admin" WHERE id=?');
        $stmt->bind_param('i',$uid); $stmt->execute();
    } elseif($_POST['accion']==='demote') {
        $stmt = $conexion->prepare('UPDATE usuarios SET role="user" WHERE id=?');
        $stmt->bind_param('i',$uid); $stmt->execute();
    }
    header('Location: users.php');
    exit;
}

// Parámetros de listado
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 20; $offset = ($page-1)*$perPage;
$search = trim($_GET['q'] ?? '');
$where = 'WHERE 1=1'; $params=[]; $types='';
if($search !== '') {
    $where .= ' AND (correo LIKE ? OR nombre LIKE ? OR apodo LIKE ?)';
    $like = '%'.$search.'%';
    $params[]=$like; $params[]=$like; $params[]=$like; $types.='sss';
}

// Consulta principal
$sql = "SELECT SQL_CALC_FOUND_ROWS id, correo, nombre, apodo, role, last_login FROM usuarios $where ORDER BY id DESC LIMIT ? OFFSET ?";
$params[]=$perPage; $params[]=$offset; $types.='ii';
$stmt = $conexion->prepare($sql);
if($params) $stmt->bind_param($types, ...$params);
$stmt->execute(); $res = $stmt->get_result();
$usuarios = [];
while($row = $res->fetch_assoc()) $usuarios[]=$row;
$total = (int)mysqli_fetch_assoc(mysqli_query($conexion,'SELECT FOUND_ROWS() t'))['t'];
$pages = max(1, ceil($total/$perPage));
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Admin - Usuarios</title>
  <link rel="stylesheet" href="../admin.css">
  <link rel="stylesheet" href="../style.css">
  <style>
    .toolbar{display:flex;gap:.75rem;align-items:center;margin:1rem 0;}
    .toolbar form{margin:0;}
    table.users{width:100%;border-collapse:collapse;background:var(--admin-card);}
    table.users th,table.users td{padding:.55rem .6rem;border-bottom:1px solid var(--admin-border);font-size:.75rem;}
    table.users th{background:rgba(0,0,0,.05);text-align:left;font-weight:600;}
    .role-badge{padding:.2rem .45rem;border-radius:6px;background:#ececec;font-size:.6rem;font-weight:600;letter-spacing:.5px;}
    [data-theme="dark"] .role-badge{background:#333;}
    .pag{margin-top:1rem;display:flex;gap:.4rem;flex-wrap:wrap;}
    .pag a{padding:.35rem .6rem;border:1px solid var(--admin-border);border-radius:6px;font-size:.65rem;text-decoration:none;}
    .pag a.act{background:var(--admin-accent);color:#fff;}
  </style>
</head>
<body>
<header class="admin-topbar"><h1>Usuarios</h1><nav><a href="index.php">Panel</a></nav></header>
<main style="padding:1rem 1.25rem;">
  <div class="toolbar">
    <form method="get">
      <input type="text" name="q" value="<?=h($search)?>" placeholder="Buscar usuario" style="padding:.4rem .55rem;border:1px solid var(--admin-border);border-radius:8px;" />
      <button>Buscar</button>
    </form>
    <div style="margin-left:auto;font-size:.7rem;opacity:.7;">Total: <?=$total?></div>
  </div>
  <div style="overflow-x:auto;">
    <table class="users">
      <thead>
        <tr><th>ID</th><th>Correo</th><th>Nombre</th><th>Apodo</th><th>Rol</th><th>Último acceso</th><th>Acciones</th></tr>
      </thead>
      <tbody>
      <?php foreach($usuarios as $u): ?>
        <tr>
          <td><?=$u['id']?></td>
          <td><?=h($u['correo'])?></td>
          <td><?=h($u['nombre'] ?? '')?></td>
            <td><?=h($u['apodo'] ?? '')?></td>
          <td><span class="role-badge"><?=h($u['role'])?></span></td>
          <td><?=h($u['last_login'] ? $u['last_login'] : '-')?></td>
          <td>
            <?php if($u['role']!=='admin'): ?>
              <form method="post" style="display:inline;">
                <?=csrf_field()?>
                <input type="hidden" name="uid" value="<?=$u['id']?>" />
                <input type="hidden" name="accion" value="promote" />
                <button title="Hacer admin" style="background:#2d7ef7;">Admin</button>
              </form>
            <?php elseif($u['id'] != $_SESSION['usuario_id']): ?>
              <form method="post" style="display:inline;">
                <?=csrf_field()?>
                <input type="hidden" name="uid" value="<?=$u['id']?>" />
                <input type="hidden" name="accion" value="demote" />
                <button title="Quitar admin" style="background:#f15f2f;">User</button>
              </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if(!$usuarios): ?>
        <tr><td colspan="7" style="text-align:center;opacity:.6;">Sin resultados</td></tr>
      <?php endif; ?>
      </tbody>
    </table>
  </div>
  <div class="pag">
    <?php for($i=1;$i<=$pages;$i++): $qStr = $search!=='' ? '&q='.urlencode($search):''; ?>
      <a href="?page=<?=$i.$qStr?>" class="<?=$i===$page?'act':''?>"><?=$i?></a>
    <?php endfor; ?>
  </div>
</main>
</body>
</html>
