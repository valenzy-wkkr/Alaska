<?php
// Página para solicitar restablecimiento de contraseña
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperar contraseña - Alaska</title>
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="style/login.css" />
    <link rel="shortcut icon" href="img/alaska-ico.ico" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
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
      <h2>Recuperar contraseña</h2>
      <?php if(isset($_GET['status']) && $_GET['status']==='sent'): ?>
        <div class="error-message" style="background:var(--fondo-claro);color:var(--texto-secundario);border:1px solid var(--color-borde);">
          Si el correo existe se ha generado un enlace de recuperación.<br>
          Revise su bandeja (o, en modo desarrollo, use el enlace mostrado en pantalla). 
        </div>
      <?php endif; ?>
      <form action="php/forgot_password_request.php" method="POST">
        <div class="form-group">
          <label for="correo">Correo asociado a la cuenta:</label>
          <input type="email" id="correo" name="correo" required autocomplete="email">
        </div>
        <button type="submit" class="btn-login">Enviar enlace</button>
      </form>
      <a href="login.php">Volver al inicio de sesión</a>
    </div>
  </main>

  <footer class="pie-pagina">
    <div class="contenedor">
      <div class="copyright">
        <p>&copy; 2025 Alaska. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
  <script src="views/MenuView.js"></script>
  <script src="js/theme-toggle.js"></script>
</body>
</html>
