<?php
session_start();
require_once __DIR__.'/php/conexion.php';

$token = isset($_GET['token']) ? $_GET['token'] : '';
$valid = false; $correo='';
if($token){
  $hash = hash('sha256', $token);
  $sql = "SELECT pr.id, pr.user_id, u.correo, pr.expires_at FROM password_resets pr JOIN usuarios u ON u.id=pr.user_id WHERE pr.token_hash=? AND pr.used_at IS NULL LIMIT 1";
  $stmt = $conexion->prepare($sql);
  $stmt->bind_param('s',$hash);
  $stmt->execute();
  $res = $stmt->get_result();
  if($row = $res->fetch_assoc()){
    if(strtotime($row['expires_at']) > time()){
      $valid = true;
      $correo = $row['correo'];
    }
  }
  $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contraseña - Alaska</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="style/login.css" />
  <link rel="shortcut icon" href="img/alaska-ico.ico" type="image/x-icon" />
</head>
<body>
  <header class="cabecera-principal">
    <div class="contenedor contenedor-cabecera">
      <div class="logo">
        <div class="contenedor-logo">
          <div class="contenedor-imagen-logo">
            <img src="img/logo.jpg" alt="Logo Alaska" class="img-logo" />
          </div>
          <h1>ALASKA</h1>
        </div>
      </div>
      <nav class="navegacion-principal">
        <ul class="lista-navegacion">
          <li><a href="index.html#inicio">Inicio</a></li>
          <li><a href="login.php">Iniciar sesión</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main>
    <div class="login-container">
      <h2>Restablecer contraseña</h2>
      <?php if(isset($_GET['done'])): ?>
        <div class="error-message" style="background:var(--fondo-claro);color:var(--texto-secundario);border:1px solid var(--color-borde);">Contraseña actualizada. Ya puede <a href="login.php">iniciar sesión</a>.</div>
      <?php elseif(!$valid): ?>
        <div class="error-message">Enlace inválido o expirado.</div>
      <?php else: ?>
        <p style="font-size:.85rem;opacity:.8;">Correo: <strong><?php echo htmlspecialchars($correo, ENT_QUOTES,'UTF-8'); ?></strong></p>
        <form action="php/reset_password_process.php" method="POST" autocomplete="off">
          <input type="hidden" name="token" value="<?php echo htmlspecialchars($token, ENT_QUOTES,'UTF-8'); ?>">
          <div class="form-group">
            <label for="nueva">Nueva contraseña</label>
            <input type="password" id="nueva" name="nueva" required minlength="6" autocomplete="new-password">
          </div>
            <div class="form-group">
            <label for="confirmar">Confirmar contraseña</label>
            <input type="password" id="confirmar" name="confirmar" required minlength="6" autocomplete="new-password">
          </div>
          <button type="submit" class="btn-login">Actualizar</button>
        </form>
      <?php endif; ?>
      <a href="login.php">Volver</a>
    </div>
    <?php if(isset($_SESSION['dev_reset_link'])): ?>
      <div style="max-width:480px;margin:1rem auto;font-size:.75rem;opacity:.7;">Enlace de desarrollo generado: <code><?php echo htmlspecialchars($_SESSION['dev_reset_link'],ENT_QUOTES,'UTF-8'); ?></code><?php unset($_SESSION['dev_reset_link']); ?></div>
    <?php endif; ?>
  </main>
  <footer class="pie-pagina"><div class="contenedor"><div class="copyright"><p>&copy; 2025 Alaska.</p></div></div></footer>
  <script src="views/MenuView.js"></script>
  <script src="js/theme-toggle.js"></script>
</body>
</html>
