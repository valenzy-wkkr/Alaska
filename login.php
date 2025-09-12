<?php
session_start();
// Redirigir si ya está autenticado
if (isset($_SESSION['usuario'])) {
  header('Location: dashboard.php');
  exit();
}
// Generar token CSRF (persistente por sesión)
if (empty($_SESSION['csrf_token'])) {
  $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
// Prefill correo si cookie remember_email existe
$correoRecordado = isset($_COOKIE['remember_email']) ? htmlspecialchars($_COOKIE['remember_email'], ENT_QUOTES, 'UTF-8') : '';
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Iniciar Sesión - Alaska</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="style/login.css">
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
    rel="stylesheet" />
  <link rel="shortcut icon" href="img/alaska-ico.ico" type="image/x-icon">

</head>

<body>
  <!-- Header -->
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
          <li><a href="index.html#nosotros">Nosotros</a></li>
          <li><a href="contacto.html">Contacto</a></li>
          <li><a href="citas.html">Citas</a></li>
          <li><a href="blog.html">Blog</a></li>
          <li><a href="index.html#registro" class="boton-nav">Registrarse</a></li>
          <li><a href="dashboard.php" class="inicial-circulo">U</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <!-- Main -->
  <main>
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <?php if (isset($_GET['error'])): ?>
        <div class="error-message">
          <?php
            $map = [
              'credenciales' => 'Credenciales inválidas',
              'vacio' => 'Complete todos los campos',
              'csrf' => 'Sesión expirada. Intente nuevamente',
              'lock' => 'Demasiados intentos. Espere 5 minutos',
              'timeout' => 'Sesión cerrada por inactividad'
            ];
            $code = $_GET['error'];
            echo $map[$code] ?? 'Error en la solicitud';
          ?>
        </div>
      <?php endif; ?>
      <form action="php/validar_login.php" method="POST" novalidate>
        <div class="form-group">
          <label for="correo">Correo electrónico:</label>
          <input type="email" id="correo" name="correo" autocomplete="email" value="<?php echo $correoRecordado; ?>" required>
        </div>
        <div class="form-group">
          <label for="clave">Contraseña:</label>
          <div style="position:relative;">
            <input type="password" id="clave" name="clave" autocomplete="current-password" required>
            <button type="button" id="togglePass" aria-label="Mostrar u ocultar contraseña" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--color-texto-claro);cursor:pointer;font-size:.9rem;">👁️</button>
          </div>
        </div>
        <div class="form-group" style="display:flex;align-items:center;gap:.5rem;margin-top:-.5rem;">
          <input type="checkbox" id="remember" name="remember" value="1" <?php echo $correoRecordado? 'checked':''; ?> style="width:auto;">
          <label for="remember" style="margin:0;font-weight:400;cursor:pointer;">Recordar correo</label>
        </div>
        <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
        <button type="submit" class="btn-login">Iniciar Sesión</button>
      </form>
      <a href="#">¿Olvidaste tu contraseña?</a>
    </div>
  </main>

  <!-- Footer removido según directiva (se mantiene sólo en index) -->

  <!-- Scripts -->
  <script>
  // Toggle mostrar/ocultar password
  const toggle = document.getElementById('togglePass');
  const pass = document.getElementById('clave');
  if(toggle && pass){
    toggle.addEventListener('click', ()=>{
      const is = pass.getAttribute('type')==='password';
      pass.setAttribute('type', is? 'text':'password');
      toggle.textContent = is? '🙈':'👁️';
    });
  }
  </script>
</body>

</html>