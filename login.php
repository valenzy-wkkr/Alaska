<?php
session_start();
if(isset($_SESSION['usuario'])) {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Iniciar Sesión - Alaska</title>
  <link rel="stylesheet" href="style.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <link rel="shortcut icon" href="img/alaska-ico.ico" type="image/x-icon">
  <style>
    /* Estilos adicionales específicos para login */
    body {
      background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
    }

    .login-container {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background-color: #fff;
      border-radius: var(--radio-borde-grande);
      box-shadow: var(--sombra-caja);
      animation: fadeIn 0.8s ease-in-out;
    }

    .login-container h2 {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      color: var(--color-primario);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--color-texto);
    }

    .form-group input {
      width: 100%;
      padding: 0.9rem 1rem;
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-borde);
      font-size: 1rem;
      transition: var(--transicion);
    }

    .form-group input:focus {
      border-color: var(--color-primario);
      box-shadow: 0 0 0 3px rgba(91, 140, 90, 0.2);
      outline: none;
    }

    .btn-login {
      width: 100%;
      padding: 1rem;
      background-color: var(--color-secundario);
      color: var(--color-texto-blanco);
      border: none;
      border-radius: var(--radio-borde);
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: var(--transicion);
    }

    .btn-login:hover {
      background-color: var(--color-acento);
      transform: translateY(-2px);
      box-shadow: var(--sombra-caja-hover);
    }

    .error-message {
      background: rgba(255, 112, 67, 0.1);
      border: 1px solid var(--color-secundario);
      border-radius: var(--radio-borde);
      padding: 0.8rem;
      margin-bottom: 1.5rem;
      text-align: center;
      color: var(--color-secundario);
      font-weight: 500;
    }

    .login-container a {
      display: inline-block;
      margin-top: 1rem;
      text-align: center;
      width: 100%;
      color: var(--color-primario);
      font-weight: 500;
      transition: var(--transicion);
    }

    .login-container a:hover {
      color: var(--color-secundario);
      text-decoration: underline;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }




            .inicial-circulo {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 35px !important;
    height: 35px !important;
    min-width: 35px !important;
    min-height: 35px !important;
    border-radius: 50% !important;
    background-color: var(--color-acento) !important;
    color: white !important;
    padding: 0 !important;
    margin: 0 8px !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
    box-shadow: 0 2px 8px rgba(255, 112, 67, 0.4) !important;
    text-decoration: none !important;
    line-height: 1 !important;
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    box-sizing: border-box !important;
    position: relative !important;
    overflow: hidden !important;
    }

    .inicial-circulo:hover {
    background-color: rgba(255, 112, 67, 0.9) !important;
    color: white !important;
    transform: translateY(-2px) scale(1.08) !important;
    box-shadow: 0 4px 15px rgba(255, 112, 67, 0.6) !important;
    border-color: rgba(255, 255, 255, 1) !important;
    }

    .inicial-circulo::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    width: 20%;
    height: 20%;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    transition: all 0.3s ease;
    opacity: 0;
    }

    .inicial-circulo:hover::before {
    width: 70%;
    height: 70%;
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
    }
  </style>
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
          <button class="boton-menu-movil" aria-label="Abrir menú">
              <i class="fas fa-bars"></i>
          </button>
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
        <?php if(isset($_GET['error'])): ?>
            <div class="error-message">
                <?php 
                    if($_GET['error'] == 'credenciales') {
                        echo 'Usuario o contraseña incorrectos';
                    } elseif($_GET['error'] == 'vacio') {
                        echo 'Por favor complete todos los campos';
                    }
                ?>
            </div>
        <?php endif; ?>
        <form action="php/validar_login.php" method="POST">
            <div class="form-group">
                <label for="correo">Correo electrónico:</label>
                <input type="email" id="correo" name="correo" required>
            </div>
            <div class="form-group">
                <label for="clave">Contraseña:</label>
                <input type="password" id="clave" name="clave" required>
            </div>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
        </form>
        <a href="#">¿Olvidaste tu contraseña?</a>
    </div>
  </main>

  <!-- Footer -->
  <footer class="pie-pagina">
      <div class="contenedor">
          <div class="contenido-footer">
              <div class="columna-footer info-contacto">
                  <h3>Contacto</h3>
                  <p><i class="fas fa-map-marker-alt"></i> Calle Principal 123, Ciudad</p>
                  <p><i class="fas fa-phone"></i> +123 456 7890</p>
                  <p><i class="fas fa-envelope"></i> info@alaska-mascotas.com</p>
              </div>
              <div class="columna-footer enlaces-rapidos">
                  <h3>Enlaces Rápidos</h3>
                  <ul>
                      <li><a href="index.html#inicio">Inicio</a></li>
                      <li><a href="index.html#nosotros">Nosotros</a></li>
                      <li><a href="index.html#registro">Registro</a></li>
                      <li><a href="blog.html">Blog</a></li>
                  </ul>
              </div>
              <div class="columna-footer redes-sociales">
                  <h3>Síguenos</h3>
                  <div class="iconos-sociales">
                      <a href="#"><i class="fab fa-facebook-f"></i></a>
                      <a href="#"><i class="fab fa-twitter"></i></a>
                      <a href="#"><i class="fab fa-instagram"></i></a>
                      <a href="#"><i class="fab fa-youtube"></i></a>
                  </div>
              </div>
          </div>
          <div class="copyright">
              <p>&copy; 2024 Alaska - Cuidado de Mascotas. Todos los derechos reservados.</p>
          </div>
      </div>
  </footer>

  <!-- Scripts -->
  <script src="views/MenuView.js"></script>
  <script src="views/ButtonView.js"></script>
  <script src="views/FormView.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
